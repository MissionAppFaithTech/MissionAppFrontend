export type ReportTargetType = 'profile' | 'project' | 'post';

export const REPORT_REASONS = [
  'false_content',
  'spam',
  'hate_violence',
  'harassment',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/** Labels of RF 16.4, in the order the modal lists them. */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  false_content: 'Conteúdo falso ou enganoso',
  spam: 'Spam ou conteúdo indesejado',
  hate_violence: 'Discurso de ódio ou violência',
  harassment: 'Assédio ou bullying',
  other: 'Outro',
};

export const REPORT_DETAILS_MAX_WORDS = 250;

/** The question of RF 16.4, worded for what is being reported. */
export const REPORT_QUESTIONS: Record<ReportTargetType, string> = {
  profile: 'Por que você está denunciando este perfil?',
  project: 'Por que você está denunciando este projeto?',
  post: 'Por que você está denunciando esta postagem?',
};

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  profile: 'perfil',
  project: 'projeto',
  post: 'postagem',
};
