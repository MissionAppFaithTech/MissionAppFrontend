'use client';

import { useId, useState, type ChangeEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import PillButton from '@/components/common/PillButton';
import { countWords } from '@/lib/countWords';
import { ApiError } from '@/lib/api/client';
import { submitReport } from '@/services/report.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import {
  REPORT_DETAILS_MAX_WORDS,
  REPORT_QUESTIONS,
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  type ReportReason,
  type ReportTargetType,
} from '@/types/report';

export const REPORT_SUCCESS_MESSAGE = 'Denúncia enviada com sucesso';
export const REPORT_FAILURE_MESSAGE =
  'Não foi possível enviar sua denúncia. Tente novamente mais tarde';
export const REPORT_DUPLICATE_MESSAGE = 'Você já denunciou este conteúdo';
export const REPORT_LOGIN_MESSAGE = 'Entre na sua conta para denunciar';

type ReportDialogProps = {
  open: boolean;
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
};

/**
 * Report modal (RF 16.4): one required reason, a free text for "Outro" (up to
 * 250 words) and the "DENUNCIAR" button. Success and failure both close the
 * modal and show a toast.
 */
export default function ReportDialog({ open, targetType, targetId, onClose }: ReportDialogProps) {
  const titleId = useId();
  const questionId = useId();
  const detailsId = useId();
  const detailsHelpId = useId();
  const notify = useFeedbackStore((s) => s.notify);
  const router = useRouter();
  const pathname = usePathname();

  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  const words = countWords(details);
  const isOther = reason === 'other';
  const overLimit = words > REPORT_DETAILS_MAX_WORDS;
  const canSubmit = Boolean(reason) && (!isOther || (words > 0 && !overLimit));

  const reset = () => {
    setReason('');
    setDetails('');
    setSending(false);
  };

  const close = () => {
    if (sending) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason || !canSubmit || sending) return;
    setSending(true);
    try {
      await submitReport({
        targetType,
        targetId,
        reason,
        ...(isOther ? { details: details.trim() } : {}),
      });
      notify(REPORT_SUCCESS_MESSAGE, 'success');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        notify(REPORT_LOGIN_MESSAGE, 'info');
        router.push(`/login?next=${encodeURIComponent(pathname || '/')}`);
      } else if (error instanceof ApiError && error.status === 409) {
        notify(REPORT_DUPLICATE_MESSAGE, 'error');
      } else {
        notify(REPORT_FAILURE_MESSAGE, 'error');
      }
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
      slotProps={{
        transition: { onExited: reset },
        paper: {
          'aria-busy': sending || undefined,
          sx: { borderRadius: 3, p: 1, mx: 2, maxWidth: { xs: '100%', sm: 440 } },
        },
      }}
    >
      <DialogTitle id={titleId} sx={{ fontWeight: 700, pr: 7 }}>
        Denunciar
        <IconButton
          aria-label="Fechar"
          onClick={close}
          disabled={sending}
          sx={{ position: 'absolute', top: 12, right: 12, width: 44, height: 44 }}
        >
          <CloseIcon aria-hidden />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} useFlexGap sx={{ minWidth: 0, pt: 0.5 }}>
          <FormControl component="fieldset" required>
            <FormLabel
              id={questionId}
              component="legend"
              sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}
            >
              {REPORT_QUESTIONS[targetType]}
            </FormLabel>
            <RadioGroup
              aria-labelledby={questionId}
              name="report-reason"
              value={reason}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setReason(event.target.value as ReportReason)
              }
            >
              {REPORT_REASONS.map((value) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio required sx={{ p: 1.5 }} />}
                  label={REPORT_REASON_LABELS[value]}
                  disabled={sending}
                  sx={{ minHeight: 44, mr: 0, wordBreak: 'break-word' }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {isOther ? (
            <Stack spacing={0.5} useFlexGap>
              <TextField
                id={detailsId}
                label="Escreva a razão da Denúncia"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                multiline
                minRows={3}
                fullWidth
                required
                disabled={sending}
                error={overLimit}
                slotProps={{
                  htmlInput: {
                    'aria-invalid': overLimit || undefined,
                    'aria-describedby': detailsHelpId,
                  },
                }}
              />
              <FormHelperText
                id={detailsHelpId}
                error={overLimit}
                role={overLimit ? 'alert' : undefined}
                aria-live="polite"
                sx={{ mx: 0 }}
              >
                {overLimit
                  ? `Limite excedido: ${words} de ${REPORT_DETAILS_MAX_WORDS} palavras.`
                  : `${words} de ${REPORT_DETAILS_MAX_WORDS} palavras`}
              </FormHelperText>
            </Stack>
          ) : null}

          <PillButton
            tone="danger"
            size="medium"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={sending}
            sx={{ width: '100%', justifyContent: 'center', minHeight: 44 }}
          >
            DENUNCIAR
          </PillButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
