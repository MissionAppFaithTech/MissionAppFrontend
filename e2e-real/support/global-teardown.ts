import { dropDatabase, dropSearchIndexes, flushRedis } from './stack.mjs';

/** Leaves nothing behind: drops `app_e2e`, the `e2e_` indexes and the suite's Redis db. */
export default async function globalTeardown() {
  dropDatabase();
  await dropSearchIndexes();
  flushRedis();
}
