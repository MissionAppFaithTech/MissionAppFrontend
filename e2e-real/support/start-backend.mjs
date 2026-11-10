/**
 * `webServer` of the `e2e-real` suite: resets `app_e2e` (migrations + seeds)
 * and serves the backend on its own port together with its queue workers
 * (`node ace queue:workers`, every queue): without them uploads stay
 * `PROCESSING` and nothing queued ever runs. The database is dropped by the
 * global teardown.
 */
import { spawn } from 'node:child_process';
import { BACKEND_DIR, backendEnv, resetDatabase } from './stack.mjs';

resetDatabase();

const ace = (...args) =>
  spawn('node', ['ace', ...args], { cwd: BACKEND_DIR, env: backendEnv(), stdio: 'inherit' });

const server = ace('serve', '--no-clear');
const workers = ace('queue:workers');
const processes = [server, workers];

/** The backend and its workers live and die together. */
function stop(signal = 'SIGTERM') {
  for (const child of processes) child.kill(signal);
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => stop(signal));
}
for (const child of processes) {
  child.on('exit', (code) => {
    stop();
    process.exit(code ?? 0);
  });
}
