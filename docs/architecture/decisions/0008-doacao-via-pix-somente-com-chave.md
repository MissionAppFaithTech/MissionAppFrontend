# [ADR-0008]: Doação via PIX Somente com Chave

## Dados

- **Status:** 🟢 Aceito
- **Data:** 2026-11-03
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

A tela **Configurações de Doação** (`/profile/financeiro`, `FinancialSettingsForm`) permitia, além da chave PIX, enviar a imagem de um **QR Code estático** (upload, preview com `URL.createObjectURL` e "Remover"). O modal de doação (`DonationModal`) mostrava essa imagem, ou um ícone de QR Code genérico quando não havia imagem, com a legenda "Escaneie o QR Code no app do seu banco".

Isso vinha do RF 12.1.2 da lista de requisitos ("Pode enviar opcionalmente um QR Code estático"). Na prática:

- a imagem é enviada pelo missionário e nada garante que corresponda à chave cadastrada;
- uma imagem trocada desviaria doações sem que a chave exibida mudasse;
- o ícone genérico, sem imagem, parecia um QR Code que não funcionava.

A questão central é: **o que a doação via PIX deve exibir?**

## Decisão

**Só a chave PIX.** A decisão é a mesma do [ADR-0039 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0039-pix-somente-com-chave.md), que removeu a coluna `financial_configs.qr_code_asset_id`.

- `PixConfigData` perde `qrCodeUrl`, e `financialSettingsSchema` perde `pixQrCodeUrl`.
- `FinancialSettingsForm`: sai o bloco "QR Code Estático (Opcional)" (upload, preview e "Remover"); o card passa a dizer "Transferência instantânea pela chave Pix." e usa o ícone do Pix.
- `DonationModal`: sai o cartão com a imagem (ou o ícone) e a legenda "Escaneie…". Ficam o tipo da chave, a chave e o botão "Copiar chave Pix".
- Os dados de exemplo (`src/mocks/profile.ts`) perdem a imagem.

**Divergência com a lista de requisitos:** o RF 12.1.2 ainda prevê o QR Code opcional. A atualização da lista fica com o responsável por ela.

## Justificativa

- **Uma fonte de verdade:** o apoiador vê exatamente a chave cadastrada.
- **Menos risco de fraude:** não há imagem que possa divergir da chave.
- **Menos código no cliente:** sem upload, `createObjectURL` nem `next/image` para o PIX.

## Alternativas Consideradas

1. **Manter o upload só no frontend.** Descartada: a API não guarda mais a imagem, e o campo seria perdido ao salvar.
2. **Gerar o QR Code a partir da chave (BR Code).** Fora do escopo; se for desejado, nasce da chave cadastrada, sem upload, e terá um ADR próprio.

## Consequências (Trade-offs)

### Positivas / Benefícios

- Tela e modal mais simples, sem imagem que confunda o apoiador.
- Tipos e schema alinhados à API.

### Negativas / Riscos

- **Quem preferia escanear** passa a copiar a chave, um passo a mais.
- **Divergência temporária com o RF 12.1.2** até a lista de requisitos ser atualizada.

## Referências

- [ADR-0039 do backend — PIX Somente com Chave](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0039-pix-somente-com-chave.md)
- [Lista de requisitos do MissionApp](https://missionappfaithtech.github.io/MissionAppRequirementsList/): RF 12.1.2
- [Banco Central — Pix](https://www.bcb.gov.br/estabilidadefinanceira/pix)
