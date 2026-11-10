/**
 * Isolated real stack for the `e2e-real` suite: the MissionApp backend from the
 * sibling repo on its own port, database (`app_e2e`) and Redis db, so the
 * developer's servers (3000/3333) and the `app` database are never touched.
 *
 * Needs the backend infra up (`just up` in the backend repo: Postgres,
 * Dragonfly, MinIO, Elasticsearch) and the backend `.env`.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// NOTE: relative to the frontend root (Playwright and `pnpm` run from there);
// no `import.meta`, since Playwright loads this file as CommonJS
export const BACKEND_DIR = path.resolve(
  process.env.MISSIONAPP_BACKEND_DIR ?? path.join(process.cwd(), '../MissionAppBackend')
);
export const BACKEND_PORT = process.env.E2E_REAL_API_PORT ?? '3334';
export const FRONTEND_PORT = process.env.E2E_REAL_WEB_PORT ?? '3100';
export const E2E_DATABASE = 'app_e2e';
// NOTE: the queues live in this Redis db (dev uses 0, the backend tests 1) and
// the suite's own workers consume them (`start-backend.mjs`). E-mails are real
// jobs too: specs must only use undeliverable `.test` addresses.
export const E2E_REDIS_DB = '2';
// NOTE: the suite's own catalog search indexes (backend ADR-0042), so the dev
// indexes on the same Elasticsearch are never touched.
export const E2E_INDEX_PREFIX = 'e2e_';
const PG_CONTAINER = 'missionapp-pg';
const REDIS_CONTAINER = 'missionapp-dragonfly';

/** Values of the backend `.env` (no expansion; enough for user/password keys). */
export function backendEnvFile() {
  const values = {};
  for (const line of readFileSync(path.join(BACKEND_DIR, '.env'), 'utf8').split('\n')) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return values;
}

/** The backend `.env` overridden by the isolated port, database and Redis db. */
export function backendEnv() {
  return {
    ...process.env,
    PORT: BACKEND_PORT,
    DB_DATABASE: E2E_DATABASE,
    REDIS_DB: E2E_REDIS_DB,
    ELASTIC_INDEX_PREFIX: E2E_INDEX_PREFIX,
  };
}

function psql(sql) {
  const { DB_USER = 'root' } = backendEnvFile();
  execFileSync(
    'docker',
    ['exec', PG_CONTAINER, 'psql', '-U', DB_USER, '-d', 'postgres', '-qc', sql],
    {
      stdio: 'inherit',
    }
  );
}

/** Empties the suite's Redis db (queued jobs of the previous run). */
export function flushRedis() {
  const { REDIS_PASSWORD = '' } = backendEnvFile();
  execFileSync(
    'docker',
    [
      'exec',
      '-e',
      `REDISCLI_AUTH=${REDIS_PASSWORD}`,
      REDIS_CONTAINER,
      'redis-cli',
      '-n',
      E2E_REDIS_DB,
      'FLUSHDB',
    ],
    { stdio: 'ignore' }
  );
}

/** Drops the suite's database, even with the backend still connected. */
export function dropDatabase() {
  psql(`DROP DATABASE IF EXISTS ${E2E_DATABASE} WITH (FORCE)`);
}

/** Deletes the suite's Elasticsearch indexes (`e2e_*`, behind their aliases). */
export async function dropSearchIndexes() {
  const values = backendEnvFile();
  // NOTE: expands the `${VAR}` references of the backend `.env` (ES_HOST, ES_PORT)
  const base = (values.ELASTIC_NODE ?? 'http://localhost:9200')
    .replace(/\$\{(\w+)\}/g, (_, key) => values[key] ?? '')
    .replace(/\/$/, '');
  const response = await fetch(`${base}/_cat/indices/${E2E_INDEX_PREFIX}*?h=index&format=json`);
  if (!response.ok) return;
  // NOTE: one by one; wildcard deletes are refused by default (destructive_requires_name)
  for (const { index } of await response.json()) {
    await fetch(`${base}/${index}`, { method: 'DELETE' });
  }
}

/**
 * Recreates the suite's database from the backend migrations and seeds, and
 * its catalog search indexes from that database.
 */
export function resetDatabase() {
  dropDatabase();
  psql(`CREATE DATABASE ${E2E_DATABASE}`);
  const ace = (...args) =>
    execFileSync('node', ['ace', ...args], {
      cwd: BACKEND_DIR,
      env: backendEnv(),
      stdio: 'inherit',
    });
  ace('migration:run', '--force');
  ace('db:seed');
  ace('search:reindex-catalogs');
  flushRedis();
}
