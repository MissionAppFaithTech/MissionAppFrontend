'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { listActiveSessions } from '@/services/auth.service';

export function activeSessionsQuery() {
  return queryOptions({ queryKey: queryKeys.activeSessions(), queryFn: listActiveSessions });
}

export function useActiveSessions() {
  return useQuery(activeSessionsQuery());
}
