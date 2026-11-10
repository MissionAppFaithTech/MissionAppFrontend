'use server';

import { backendFetch } from '@/lib/api/backend';
import { parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import { reportInputSchema } from '@/schemas/actions.schema';
import type { ReportReason, ReportTargetType } from '@/types/report';

/** Reports (RF 16). Input is untrusted: always validated here. */
export async function reportAction(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<ActionResult<{ reported: true }>> {
  const parsed = parseInput(reportInputSchema, input, 'Dados da denúncia inválidos');
  if (!parsed.ok) return parsed;

  return runWithSession(
    'actions/report',
    'Não foi possível enviar sua denúncia. Tente novamente mais tarde',
    async (accessToken) => {
      await backendFetch('/reports', {
        method: 'POST',
        body: parsed.data,
        accessToken,
      });
      return { reported: true as const };
    }
  );
}
