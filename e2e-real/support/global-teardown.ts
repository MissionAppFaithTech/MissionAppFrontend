import { dropDatabase, flushRedis } from './stack.mjs';

/** Leaves nothing behind: drops `app_e2e` and empties the suite's Redis db. */
export default function globalTeardown() {
  dropDatabase();
  flushRedis();
}
