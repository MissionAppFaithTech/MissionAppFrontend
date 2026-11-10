/**
 * Fake MissionApp backend for the e2e suite. Owner pages read the profile on the
 * server (ADR-0005) and save it through Server Actions (ADR-0006), so
 * `page.route` can no longer answer those calls: the app under test talks to
 * this server instead (`API_URL`, see playwright.config.ts).
 *
 * Each user (the token `sub`) gets their own copy of the fixture, so a spec that
 * edits its profile never changes what other specs read.
 *
 * Runs on its own port (3335 by default) so it never touches a real backend.
 */
import { createServer } from 'node:http';
import missionaryProfile from './missionary-profile.json' with { type: 'json' };

const port = Number(process.env.E2E_MOCK_API_PORT || 3335);

/** Tokens for this user act like a session the backend already ended. */
const REVOKED_USER = 'e2e-revoked';
/**
 * The only account `POST /auth/login` accepts. `samuel+<tag>@privado.test` logs in
 * as a user of its own (`e2e-login-<tag>`), so a spec can count its sessions alone.
 */
const LOGIN = { email: /^samuel(?:\+([\w-]+))?@privado\.test$/, password: 'Senha@123' };
const isLoginUser = (sub) => sub.startsWith('e2e-login');

/** The "worker" cannot process the photos these users upload (`FAILED`). */
const failsPhotoProcessing = (sub) => sub.startsWith('e2e-photo-fail');

/** `POST /accounts` answers "e-mail em uso" for this address. */
const TAKEN_EMAIL = 'usado@missionapp.test';
/** `POST /accounts/missionaries` answers "CPF já cadastrado" for this document. */
const TAKEN_CPF = '11144477735';

/**
 * Catalogs searched like the backend (ADR-0041): accent and case insensitive,
 * 2 letters by prefix and 3+ by "contains", `limit` (default 10) and
 * `meta.hasMore`. Items created by the specs join the list.
 */
const catalogs = {
  faithCommunities: [
    { id: '019a0000-0000-7000-9000-00000000c001', name: 'Igreja Batista Central', city: 'Niterói' },
    {
      id: '019a0000-0000-7000-9000-00000000c002',
      name: 'Igreja Presbiteriana da Paz',
      city: 'Recife',
    },
  ],
  missionaryAgencies: [
    { id: '019a0000-0000-7000-9000-00000000a001', name: 'JOCUM', city: 'Contagem' },
    { id: '019a0000-0000-7000-9000-00000000a002', name: 'Missão Ágape', city: 'São Paulo' },
    ...Array.from({ length: 11 }, (_, index) => ({
      id: `019a0000-0000-7000-9000-00000000b${String(index + 1).padStart(3, '0')}`,
      name: `Missões Unidas ${String(index + 1).padStart(2, '0')}`,
      city: 'Recife',
    })),
  ],
};
let catalogSequence = 0;

const normalizeCatalog = (value = '') =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const searchCatalog = (kind) => (request, response) => {
  const params = new URL(request.url ?? '/', 'http://localhost').searchParams;
  const term = normalizeCatalog(params.get('search') ?? '');
  if (params.has('search') && term.length < 2) {
    return send(response, 422, {
      message: 'Validation failure',
      code: 'E_VALIDATION_ERROR',
      errors: [{ field: 'search', rule: 'minLength', message: 'Too short', meta: { min: 2 } }],
    });
  }
  const limit = Math.min(Number(params.get('limit')) || 10, 20);
  const matches = catalogs[kind]
    .filter(({ name }) => {
      const key = normalizeCatalog(name);
      return !term || (term.length < 3 ? key.startsWith(term) : key.includes(term));
    })
    .sort((a, b) => normalizeCatalog(a.name).localeCompare(normalizeCatalog(b.name)));
  return send(response, 200, {
    data: { [kind]: matches.slice(0, limit) },
    meta: { hasMore: matches.length > limit },
  });
};

/** `POST /<catalog>` refuses this name with a field error (any 422 the API may send). */
const REFUSED_CATALOG_NAME = 'Cadastro Recusado';

/**
 * `POST /<catalog>`: the same name in the same city (accents and case aside)
 * reuses the existing item instead of duplicating it, like the backend.
 */
const createCatalogItem = (kind, singular) =>
  authenticated((_profile, body, response) => {
    if (body.name === REFUSED_CATALOG_NAME) {
      return send(response, 422, {
        message: 'Validation failure',
        code: 'E_VALIDATION_ERROR',
        errors: [{ field: 'name', rule: 'catalogName', message: 'Este nome não é aceito.' }],
      });
    }
    const key = (item) => `${normalizeCatalog(item.name)}|${normalizeCatalog(item.city)}`;
    const existing = catalogs[kind].find((item) => key(item) === key(body));
    if (existing) return send(response, 201, { data: { [singular]: existing } });
    catalogSequence += 1;
    const item = {
      id: `019a0000-0000-7000-9000-${String(catalogSequence).padStart(12, 'f')}`,
      name: body.name,
      city: body.city,
    };
    catalogs[kind].push(item);
    return send(response, 201, { data: { [singular]: item } });
  });

const profiles = new Map();

function profileOf(sub) {
  if (!profiles.has(sub)) profiles.set(sub, structuredClone(missionaryProfile));
  return profiles.get(sub);
}

/**
 * Direct upload (backend ADR-0040): the browser PUTs the file to the presigned
 * URL (`/storage/<id>` here), confirms it and the worker compresses it. The
 * first status read after the completion still says PROCESSING, like a real
 * queue, so the front has to wait for READY.
 */
const mediaAssets = new Map();
let mediaSequence = 0;

const assetUrl = (asset) =>
  asset.status === 'READY' ? `http://localhost:${port}/storage/${asset.id}` : null;
const assetJson = (asset) => ({
  id: asset.id,
  purpose: asset.purpose,
  mimeType: asset.mimeType,
  status: asset.status,
  url: assetUrl(asset),
});

/** `user.profilePictureUrl` follows the linked asset, `null` while processing. */
function withPicture(user) {
  const asset = user.profilePictureId ? mediaAssets.get(user.profilePictureId) : undefined;
  return { ...user, profilePictureUrl: asset ? assetUrl(asset) : null };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function storeFile(request, response, id) {
  const asset = mediaAssets.get(id);
  if (!asset) {
    response.writeHead(404, CORS_HEADERS);
    return response.end();
  }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  asset.bytes = Buffer.concat(chunks);
  response.writeHead(200, CORS_HEADERS);
  return response.end();
}

function serveFile(response, id) {
  const asset = mediaAssets.get(id);
  if (!asset?.bytes || asset.status !== 'READY') {
    response.writeHead(404, CORS_HEADERS);
    return response.end();
  }
  response.writeHead(200, { ...CORS_HEADERS, 'Content-Type': asset.mimeType });
  return response.end(asset.bytes);
}

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(body === undefined ? '' : JSON.stringify(body));
}

function emailTaken(response) {
  return send(response, 422, {
    message: 'Validation failure',
    code: 'E_VALIDATION_ERROR',
    errors: [
      { field: 'email', rule: 'database.unique', message: 'The email has already been taken' },
    ],
  });
}

async function signUp(request, response) {
  const body = await readBody(request);
  if (body.email === TAKEN_EMAIL) return emailTaken(response);
  const sub = `e2e-signup-${body.username}`;
  return send(response, 200, {
    data: {
      user: { ...profileOf(sub).user, id: sub, email: body.email, username: body.username },
      accessToken: accessTokenFor(sub),
      refreshToken: `refresh-${sub}`,
    },
  });
}

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

function accessTokenFor(sub, fid) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${base64url({ alg: 'HS256' })}.${base64url({ sub, fid, role: 'MISSIONARY', exp })}.e2e`;
}

function claimsOf(request) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return JSON.parse(Buffer.from(header.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

/** The `sub` of a valid bearer token, or null. */
function userOf(request) {
  const sub = claimsOf(request)?.sub;
  return sub && sub !== REVOKED_USER ? sub : null;
}

/**
 * Active sessions per user, one per device (backend ADR-0038). Users that never
 * logged in here (`mockMissionarySession`) start with this browser and a phone.
 */
const sessions = new Map();
const DEFAULT_CURRENT_SESSION = '019a0000-0000-7000-8000-000000000001';
const HOUR = 60 * 60 * 1000;
const iso = (ms) => new Date(ms).toISOString();

function sessionsOf(sub) {
  if (!sessions.has(sub)) {
    const now = Date.now();
    sessions.set(
      sub,
      isLoginUser(sub)
        ? []
        : [
            {
              id: DEFAULT_CURRENT_SESSION,
              deviceType: 'web',
              deviceKind: 'desktop',
              deviceName: 'Chrome no Windows',
              ipAddress: null,
              lastUsedAt: iso(now),
              createdAt: iso(now),
              startedAt: iso(now - 72 * HOUR),
              deviceId: null,
            },
            {
              id: '019a0000-0000-7000-8000-000000000002',
              deviceType: 'web',
              deviceKind: 'mobile',
              deviceName: 'Mobile Safari no iOS',
              ipAddress: null,
              lastUsedAt: iso(now - HOUR),
              createdAt: iso(now - HOUR),
              startedAt: iso(now - 240 * HOUR),
              deviceId: null,
            },
          ]
    );
  }
  return sessions.get(sub);
}

/** Login replaces the session of the same `x-device-id`, like the backend. */
function startSession(sub, headers) {
  const deviceId = headers['x-device-id'] ?? null;
  const now = iso(Date.now());
  const others = sessionsOf(sub).filter((session) => !deviceId || session.deviceId !== deviceId);
  const session = {
    id: crypto.randomUUID(),
    deviceType: 'web',
    deviceKind: headers['x-device-kind'] ?? 'unknown',
    deviceName: headers['x-device-name'] ?? null,
    ipAddress: null,
    lastUsedAt: now,
    createdAt: now,
    startedAt: now,
    deviceId,
  };
  sessions.set(sub, [session, ...others]);
  return session;
}

function listSessions(request, response) {
  const sub = userOf(request);
  if (!sub) return unauthorized(response);
  const fid = claimsOf(request)?.fid ?? DEFAULT_CURRENT_SESSION;
  return send(response, 200, {
    data: sessionsOf(sub).map(({ deviceId: _deviceId, ...session }) => ({
      ...session,
      current: session.id === fid,
    })),
  });
}

function endSession(request, response, sessionId) {
  const sub = userOf(request);
  if (!sub) return unauthorized(response);
  const list = sessionsOf(sub);
  if (!list.some((session) => session.id === sessionId)) {
    return send(response, 404, { message: 'Sessão não encontrada', code: 'E_SESSION_NOT_FOUND' });
  }
  sessions.set(
    sub,
    list.filter((session) => session.id !== sessionId)
  );
  return send(response, 200, { message: 'Sessão encerrada' });
}

async function readBody(request) {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const unauthorized = (response) =>
  send(response, 401, { message: 'Unauthorized access', code: 'E_UNAUTHORIZED_ACCESS' });

/** Routes that need a session receive the user's profile copy. */
const authenticated = (handler) => async (request, response) => {
  const sub = userOf(request);
  if (!sub) return unauthorized(response);
  return handler(profileOf(sub), await readBody(request), response);
};

const routes = {
  'POST /api/v1/auth/login': async (request, response) => {
    const { login, password } = await readBody(request);
    const match = typeof login === 'string' ? LOGIN.email.exec(login) : null;
    if (!match || password !== LOGIN.password) {
      return send(response, 400, {
        message: 'Invalid user credentials',
        code: 'E_INVALID_CREDENTIALS',
      });
    }
    const sub = match[1] ? `e2e-login-${match[1]}` : 'e2e-login';
    const session = startSession(sub, request.headers);
    return send(response, 200, {
      data: {
        user: { ...profileOf(sub).user, id: sub },
        accessToken: accessTokenFor(sub, session.id),
        refreshToken: `refresh-${sub}`,
      },
    });
  },
  'DELETE /api/v1/auth/logout': (_request, response) => send(response, 204),
  // Sign-up (backend `POST /accounts` and `POST /accounts/missionaries`): this
  // address is always taken, so the wizard has a field the API rejects at the end.
  'POST /api/v1/accounts': signUp,
  'POST /api/v1/accounts/missionaries': async (request, response) => {
    const body = await readBody(request);
    if (body.email === TAKEN_EMAIL) return emailTaken(response);
    if (body.identityType === 'CPF' && body.identityDocument === TAKEN_CPF) {
      return send(response, 422, {
        message: 'Validation failure',
        code: 'E_VALIDATION_ERROR',
        errors: [
          {
            field: 'identityDocument',
            rule: 'database.unique',
            message: 'Este CPF já está cadastrado.',
          },
        ],
      });
    }
    const sub = `e2e-signup-${body.username}`;
    const profile = profileOf(sub);
    profile.user = {
      ...profile.user,
      id: sub,
      email: body.email,
      username: body.username,
      role: 'MISSIONARY',
    };
    return send(response, 200, {
      data: {
        user: profile.user,
        missionary: profile.missionary,
        workAddress: null,
        missionaryAgency: body.missionaryAgency
          ? { id: 'ma-e2e-new', name: body.missionaryAgency.name }
          : { id: body.missionaryAgencyId, name: 'JOCUM' },
        faithCommunity: body.faithCommunity
          ? { id: 'fc-e2e-new', name: body.faithCommunity.name }
          : body.faithCommunityId
            ? { id: body.faithCommunityId, name: 'Igreja Batista Central' }
            : null,
        accessToken: accessTokenFor(sub),
        refreshToken: `refresh-${sub}`,
      },
    });
  },
  'GET /api/v1/accounts/username-availability': (request, response) => {
    const username = new URL(request.url ?? '/', 'http://localhost').searchParams.get('username');
    return send(response, 200, { data: { available: true, username, suggestions: [] } });
  },
  'GET /api/v1/faith-communities': searchCatalog('faithCommunities'),
  'GET /api/v1/missionary-agencies': searchCatalog('missionaryAgencies'),
  'POST /api/v1/faith-communities': createCatalogItem('faithCommunities', 'faithCommunity'),
  'POST /api/v1/missionary-agencies': createCatalogItem('missionaryAgencies', 'missionaryAgency'),
  'GET /api/v1/auth/sessions': listSessions,
  'DELETE /api/v1/auth/sessions': (request, response) => {
    const sub = userOf(request);
    if (!sub) return unauthorized(response);
    sessions.set(sub, []);
    return send(response, 204);
  },
  'GET /api/v1/account/profile': authenticated((profile, _body, response) =>
    send(response, 200, { data: { ...profile, user: withPicture(profile.user) } })
  ),
  'PATCH /api/v1/account/profile': authenticated((profile, body, response) => {
    if (body.profilePictureId && !mediaAssets.has(body.profilePictureId)) {
      return send(response, 422, {
        message: 'Imagem de perfil informada não existe',
        errors: [{ field: 'profilePictureId', message: 'Imagem de perfil informada não existe' }],
      });
    }
    Object.assign(profile.user, body);
    return send(response, 200, { data: { user: withPicture(profile.user) } });
  }),
  'POST /api/v1/media-assets/uploads': authenticated((_profile, body, response) => {
    mediaSequence += 1;
    const id = `019a0000-0000-7000-8000-${String(mediaSequence).padStart(12, '0')}`;
    const asset = { id, purpose: body.purpose, mimeType: body.mimeType, status: 'PENDING_UPLOAD' };
    mediaAssets.set(id, asset);
    return send(response, 200, {
      data: {
        mediaAsset: assetJson(asset),
        upload: {
          url: `http://localhost:${port}/storage/${id}`,
          method: 'PUT',
          headers: { 'Content-Type': body.mimeType, 'Content-Length': String(body.fileSizeBytes) },
        },
      },
    });
  }),
  'PATCH /api/v1/missionaries/profile': authenticated((profile, body, response) => {
    Object.assign(profile.missionary, body);
    return send(response, 200, { data: { missionary: profile.missionary } });
  }),
  'PATCH /api/v1/missionaries/about': authenticated((profile, body, response) => {
    const { workAddress, ...about } = body;
    Object.assign(profile.missionary, about);
    if (workAddress) profile.workAddress = { ...workAddress };
    // The link carries the catalog item's name, like the backend (JOCUM if unknown).
    const linked = (kind, id, fallback) => {
      const item = catalogs[kind].find((entry) => entry.id === id);
      return { id, name: item?.name ?? fallback };
    };
    if (about.missionaryAgencyId) {
      profile.missionaryAgency = linked('missionaryAgencies', about.missionaryAgencyId, 'JOCUM');
    }
    if (about.faithCommunityId) {
      profile.faithCommunity = linked(
        'faithCommunities',
        about.faithCommunityId,
        'Igreja Batista Central'
      );
    } else if (about.faithCommunityId === null) {
      profile.faithCommunity = null;
    }
    return send(response, 200, {
      data: {
        missionary: profile.missionary,
        workAddress: profile.workAddress,
        missionaryAgency: profile.missionaryAgency,
        faithCommunity: profile.faithCommunity,
      },
    });
  }),
  'PATCH /api/v1/missionaries/work-address': authenticated((profile, body, response) => {
    profile.workAddress = { ...body };
    return send(response, 200, { data: { workAddress: profile.workAddress } });
  }),
};

/** The anonymous public profile (backend ADR-0036) of the fixture missionary. */
function publicProfile() {
  const { user, missionary, workAddress, missionaryAgency, faithCommunity } = missionaryProfile;
  return {
    username: user.username,
    fullName: user.fullName,
    biography: user.biography,
    role: user.role,
    missionaryAgency,
    faithCommunity,
    about: {
      aboutMe: missionary.aboutMe,
      missionStorySummary: missionary.missionStorySummary,
      originLocation: missionary.originLocation,
      prayerRequest: missionary.prayerRequest,
      lifeVerse: missionary.lifeVerse,
    },
    workLocation: {
      city: workAddress.city,
      state: workAddress.state,
      country: workAddress.country,
    },
    followersCount: 12,
    followingCount: 3,
    contact: {
      publicEmail: missionary.publicEmail,
      publicPhone: missionary.publicPhone,
      publicPhoneIsWhatsapp: true,
    },
  };
}

const PUBLIC_PROFILE = /^\/api\/v1\/public\/missionaries\/([^/]+)$/;
const SESSION = /^\/api\/v1\/auth\/sessions\/([^/]+)$/;
const STORAGE = /^\/storage\/([^/]+)$/;
const MEDIA_ASSET = /^\/api\/v1\/media-assets\/([^/]+)$/;
const MEDIA_COMPLETION = /^\/api\/v1\/media-assets\/([^/]+)\/completion$/;

const server = createServer((request, response) => {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (path === '/health') return send(response, 200, { ok: true });

  const publicMatch = request.method === 'GET' && PUBLIC_PROFILE.exec(path);
  if (publicMatch) {
    // Only the fixture missionary is approved and active; the rest get the same 404.
    return decodeURIComponent(publicMatch[1]) === missionaryProfile.user.username
      ? send(response, 200, { data: { missionary: publicProfile() } })
      : send(response, 404, {
          message: 'Missionary profile not found',
          code: 'E_MISSIONARY_PROFILE_NOT_FOUND',
        });
  }

  const storageMatch = STORAGE.exec(path);
  if (storageMatch) {
    const id = decodeURIComponent(storageMatch[1]);
    if (request.method === 'OPTIONS') {
      response.writeHead(204, CORS_HEADERS);
      return response.end();
    }
    if (request.method === 'PUT') return storeFile(request, response, id);
    if (request.method === 'GET') return serveFile(response, id);
  }

  const completionMatch = request.method === 'POST' && MEDIA_COMPLETION.exec(path);
  if (completionMatch) {
    const sub = userOf(request);
    if (!sub) return unauthorized(response);
    const asset = mediaAssets.get(decodeURIComponent(completionMatch[1]));
    if (!asset?.bytes) return send(response, 404, { message: 'Arquivo não encontrado' });
    asset.status = 'PROCESSING';
    asset.pendingReads = 1;
    asset.failing = failsPhotoProcessing(sub);
    return send(response, 202, { data: { mediaAsset: assetJson(asset) } });
  }

  const mediaMatch = request.method === 'GET' && MEDIA_ASSET.exec(path);
  if (mediaMatch) {
    if (!userOf(request)) return unauthorized(response);
    const asset = mediaAssets.get(decodeURIComponent(mediaMatch[1]));
    if (!asset) return send(response, 404, { message: 'Arquivo não encontrado' });
    // The "worker" finishes after one PROCESSING answer.
    if (asset.status === 'PROCESSING') {
      if (asset.pendingReads > 0) asset.pendingReads -= 1;
      else asset.status = asset.failing ? 'FAILED' : 'READY';
    }
    return send(response, 200, { data: { mediaAsset: assetJson(asset) } });
  }

  const sessionMatch = request.method === 'DELETE' && SESSION.exec(path);
  if (sessionMatch) return endSession(request, response, decodeURIComponent(sessionMatch[1]));

  const handler = routes[`${request.method} ${path}`];
  if (handler) {
    return Promise.resolve(handler(request, response)).catch((error) => {
      console.error('[mock-api]', error);
      send(response, 500, { message: 'Mock API error' });
    });
  }

  return send(response, 404, {
    message: `Cannot ${request.method}:${path}`,
    code: 'E_ROUTE_NOT_FOUND',
  });
});

server.listen(port, () => {
  console.log(`[mock-api] listening on http://localhost:${port}`);
});
