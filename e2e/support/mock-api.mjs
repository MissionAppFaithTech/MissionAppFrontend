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
/** The only account `POST /auth/login` accepts. */
const LOGIN = { email: 'samuel@privado.test', password: 'Senha@123', sub: 'e2e-login' };

const profiles = new Map();

function profileOf(sub) {
  if (!profiles.has(sub)) profiles.set(sub, structuredClone(missionaryProfile));
  return profiles.get(sub);
}

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(body === undefined ? '' : JSON.stringify(body));
}

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

function accessTokenFor(sub) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${base64url({ alg: 'HS256' })}.${base64url({ sub, role: 'MISSIONARY', exp })}.e2e`;
}

/** The `sub` of a valid bearer token, or null. */
function userOf(request) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const { sub } = JSON.parse(Buffer.from(header.split('.')[1], 'base64url').toString('utf8'));
    return sub && sub !== REVOKED_USER ? sub : null;
  } catch {
    return null;
  }
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
    if (login !== LOGIN.email || password !== LOGIN.password) {
      return send(response, 400, {
        message: 'Invalid user credentials',
        code: 'E_INVALID_CREDENTIALS',
      });
    }
    return send(response, 200, {
      data: {
        user: { ...profileOf(LOGIN.sub).user, id: LOGIN.sub },
        accessToken: accessTokenFor(LOGIN.sub),
        refreshToken: `refresh-${LOGIN.sub}`,
      },
    });
  },
  'DELETE /api/v1/auth/logout': (_request, response) => send(response, 204),
  'DELETE /api/v1/auth/sessions': authenticated((_profile, _body, response) => send(response, 204)),
  'GET /api/v1/account/profile': authenticated((profile, _body, response) =>
    send(response, 200, { data: profile })
  ),
  'PATCH /api/v1/account/profile': authenticated((profile, body, response) => {
    Object.assign(profile.user, body);
    return send(response, 200, { data: { user: profile.user } });
  }),
  'PATCH /api/v1/missionaries/profile': authenticated((profile, body, response) => {
    Object.assign(profile.missionary, body);
    return send(response, 200, { data: { missionary: profile.missionary } });
  }),
  'PATCH /api/v1/missionaries/about': authenticated((profile, body, response) => {
    Object.assign(profile.missionary, body);
    return send(response, 200, { data: { missionary: profile.missionary } });
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
