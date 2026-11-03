import { queryOptions } from '@tanstack/react-query';
import { DEFAULT_STALE_TIME_MS } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { checkUsernameAvailability } from '@/services/username.service';

/**
 * Availability of a normalized username. Never retried: the next keystroke asks
 * again. Answers stay fresh for 30 s; the backend checks again on submit.
 */
export function usernameAvailabilityQuery(username: string) {
  return queryOptions({
    queryKey: queryKeys.usernameAvailability(username),
    queryFn: () => checkUsernameAvailability(username),
    retry: false,
    staleTime: DEFAULT_STALE_TIME_MS,
  });
}
