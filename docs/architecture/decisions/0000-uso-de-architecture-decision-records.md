# [ADR-0000]: Adoção de Architecture Decision Records no Frontend

## Dados

- **Status:** 🟡 Proposto
- **Data:** 2026-11-01
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

O backend registra suas decisões arquiteturais em ADRs desde maio de 2026 ([ADR-0000 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0000-uso-de-architecture-decision-records.md)). O frontend não tem um registro equivalente. As decisões dele estão espalhadas entre `AGENTS.md`, `CLAUDE.md`, descrições de PR e comentários no código.

Isso já cria dois problemas concretos:

- **Decisões do frontend acabam no backend.** O [ADR-0032 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0032-ip-do-usuario-repassado-pelo-bff-com-segredo-compartilhado.md) descreve o BFF, mas só foi registrado lá porque o frontend não tinha onde registrar.
- **Escolhas estruturais ficam sem o porquê.** Exemplos: por que o perfil fica em `sessionStorage` sem PII, por que o navegador nunca fala direto com a API e por que o Zustand é usado do jeito que é. Quem chega ao projeto só vê o código, não as alternativas descartadas.

O projeto é open-source, com voluntários que entram e saem. O argumento do ADR-0000 do backend vale igualmente aqui.

A questão central é: **como registrar as decisões arquiteturais do frontend de forma rastreável, sem duplicar nem conflitar com os ADRs do backend?**

## Decisão

O frontend adota ADRs no mesmo formato do backend (Michael Nygard, com as adaptações do template do MissionApp):

1. **Local:** `docs/architecture/decisions/`, com o template copiado do backend em `docs/architecture/templates/adr-template.md`. O texto é em pt-BR.
2. **Numeração própria**, a partir de `0000`. Para evitar ambiguidade entre os repositórios, cita-se sempre "ADR-00XX do backend" ao referenciar o outro lado.
3. **Divisão de responsabilidade:**
   - Decisões só do frontend ficam aqui: estado, renderização, bibliotecas de UI, organização do App Router.
   - Decisões de contrato entre BFF e API ficam no backend, que é o dono do contrato: envelopes, paginação, erros, autenticação, headers.
4. **Ciclo de vida igual ao do backend:** `Proposto → Aceito → (Substituído | Obsoleto)`. Um ADR aceito não é reescrito.
5. **Aprovação:** via PR revisado por um gestor, seguindo o `CONTRIBUTING.md`.

## Justificativa

- **Um processo só para os dois repositórios:** o contribuidor que já conhece os ADRs do backend não precisa aprender outro formato.
- **Co-localização:** o ADR muda no mesmo PR do código que ele justifica.
- **A fronteira fica clara:** o contrato da API tem um único dono, então frontend e backend não registram versões divergentes do mesmo acordo.

## Alternativas Consideradas

**1. Registrar tudo no repositório do backend (numeração única)**

Mantém um índice só, mas mistura decisões de UI e de Next.js num repositório que não as implementa. Também obriga um PR no backend para cada mudança de frontend. Descartada.

**2. Manter as decisões em `AGENTS.md` / `CLAUDE.md`**

Esses arquivos dizem _como_ trabalhar hoje e são reescritos com frequência. Não guardam alternativas nem histórico. Continuam existindo como guia operacional e passam a apontar para os ADRs quando for o caso.

## Consequências (Trade-offs)

### Positivas / Benefícios

- O frontend ganha memória arquitetural própria, com histórico e alternativas descartadas.
- Decisões que cruzam BFF e API têm um lugar definido (backend), e as do frontend também (aqui).

### Negativas / Riscos

- Dois índices de ADR exigem cuidado nas referências cruzadas. Mitigação: sempre escrever "do backend" e usar o link completo.
- Escrever ADR leva tempo. Mudanças pequenas continuam só em issue + PR (ver README desta pasta).

## Referências

- [ADR-0000 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0000-uso-de-architecture-decision-records.md): processo e formato que este ADR adota
- [Documenting Architecture Decisions (Michael Nygard, 2011)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): origem do formato
- [Template deste repositório](../templates/adr-template.md): modelo para novos ADRs
