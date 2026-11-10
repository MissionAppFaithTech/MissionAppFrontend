import { reportAction } from '@/app/actions/report';
import { callAction } from '@/lib/api/callAction';
import type { ReportReason, ReportTargetType } from '@/types/report';

export type ReportPayload = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
};

/** Throws `ApiError` (401 anonymous, 409 already reported) on failure. */
export async function submitReport(payload: ReportPayload): Promise<void> {
  await callAction(() => reportAction(payload));
}
