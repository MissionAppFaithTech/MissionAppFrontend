/**
 * `webServer` of the `e2e-real` suite: resets `app_e2e` (migrations + seeds)
 * and serves the backend on its own port. The database is dropped by the
 * global teardown.
 */
import { spawn } from 'node:child_process';
import { BACKEND_DIR, backendEnv, resetDatabase } from './stack.mjs';

resetDatabase();

const server = spawn('node', ['ace', 'serve', '--no-clear'], {
  cwd: BACKEND_DIR,
  env: backendEnv(),
  stdio: 'inherit',
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
server.on('exit', (code) => process.exit(code ?? 0));
