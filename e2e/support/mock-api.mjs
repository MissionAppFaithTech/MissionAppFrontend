/**
 * Fake MissionApp backend for the e2e suite. Owner pages read the profile on the
 * server (ADR-0005), so `page.route` can no longer answer those calls: the app
 * under test talks to this server instead (`API_URL`, see playwright.config.ts).
 *
 * Runs on its own port (3335 by default) so it never touches a real backend.
 */
import { createServer } from 'node:http';
import missionaryProfile from './missionary-profile.json' with { type: 'json' };

const port = Number(process.env.E2E_MOCK_API_PORT || 3335);

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

/** Tokens for `REVOKED_USER` act like a session the backend already ended. */
export const REVOKED_USER = 'e2e-revoked';

function isRevoked(request) {
  const payload = request.headers.authorization?.split('.')[1];
  if (!payload) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).sub === REVOKED_USER;
  } catch {
    return false;
  }
}

const routes = {
  'GET /api/v1/account/profile': (request, response) => {
    if (!request.headers.authorization?.startsWith('Bearer ') || isRevoked(request)) {
      return send(response, 401, { message: 'Unauthorized access', code: 'E_UNAUTHORIZED_ACCESS' });
    }
    return send(response, 200, { data: missionaryProfile });
  },
};

const server = createServer((request, response) => {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (path === '/health') return send(response, 200, { ok: true });

  const handler = routes[`${request.method} ${path}`];
  if (handler) return handler(request, response);

  return send(response, 404, {
    message: `Cannot ${request.method}:${path}`,
    code: 'E_ROUTE_NOT_FOUND',
  });
});

server.listen(port, () => {
  console.log(`[mock-api] listening on http://localhost:${port}`);
});
