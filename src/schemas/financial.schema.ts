import { z } from 'zod';

export const financialSettingsSchema = z
  .object({
    pixEnabled: z.boolean(),
    pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
    pixKey: z.string(),
    pixQrCodeUrl: z.string(),
    bankEnabled: z.boolean(),
    bankName: z.string(),
    bankNumber: z.string(),
    agency: z.string(),
    account: z.string(),
    accountType: z.enum(['corrente', 'poupanca', 'pagamento']),
    holderName: z.string(),
    holderDocument: z.string(),
    supporterMessage: z.string().max(500, 'A mensagem não pode ultrapassar 500 caracteres'),
  })
  .superRefine((data, ctx) => {
    if (data.pixEnabled && !data.pixKey.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['pixKey'],
        message: 'Informe a chave Pix quando o método Pix estiver ativado.',
      });
    }

    if (data.bankEnabled) {
      if (!data.bankName.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['bankName'],
          message: 'Informe o nome da instituição bancária.',
        });
      }
      if (!data.agency.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['agency'],
          message: 'Informe a agência bancária.',
        });
      }
      if (!data.account.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['account'],
          message: 'Informe o número da conta com dígito.',
        });
      }
      if (!data.holderName.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['holderName'],
          message: 'Informe o nome do titular da conta.',
        });
      }
      if (!data.holderDocument.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['holderDocument'],
          message: 'Informe o CPF ou CNPJ do titular da conta.',
        });
      }
    }
  });

export type FinancialSettingsFormData = z.infer<typeof financialSettingsSchema>;
