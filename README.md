# ⛪ Mission App — Frontend

## 📋 Sumário

1. [Visão geral](#visao-geral)
2. [Tipos de acesso](#tipos-de-acesso)
3. [Estrutura do projeto](#estrutura-do-projeto)
4. [Arquitetura](#arquitetura)
5. [Stack](#stack)
6. [Pré-requisitos](#pre-requisitos)
7. [Instalação](#instalacao)
8. [Scripts disponíveis](#scripts-disponiveis)
9. [Testes](#testes)
10. [Rotas principais](#rotas-principais)
11. [Identidade visual](#identidade-visual)
12. [Links externos](#links-externos)
13. [Contribuindo](#contribuindo)
14. [Segurança](#seguranca)
15. [Licença](#licenca)

---

<a name="visao-geral"></a>

## 🗺️ Visão geral

> Conectamos missionários e apoiadores em um só lugar.

Plataforma web **open source** para aproximar quem está no campo missionário e quem envia, ora e sustenta. O Mission App centraliza atualizações, pedidos de oração e relacionamentos — para que a missão avance com mais proximidade, clareza e cuidado.

Este repositório contém o **frontend** (Next.js). A API fica no [MissionApp Backend](https://github.com/MissionAppFaithTech/MissionAppBackend).

Contribuições são bem-vindas: issues, sugestões e pull requests ajudam a tornar a ferramenta melhor para toda a comunidade missionária.

**🙏 Para missionários**

- Compartilhar atualizações com facilidade
- Receber apoio em oração
- Fortalecer a rede de mantenedores
- Manter todos conectados em um só ambiente

**💛 Para apoiadores**

- Acompanhar a jornada missionária
- Receber pedidos de oração
- Contribuir com mais proximidade
- Ver o impacto da participação

---

<a name="tipos-de-acesso"></a>

## 👥 Tipos de acesso

A plataforma distingue três papéis (alinhados ao backend). No front, o fluxo público de cadastro cobre **missionário** e **apoiador**; **admin** é interno.

| Papel        | Quem é                              | Como entra                                                                                       | O que faz na plataforma                                                                                      |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `MISSIONARY` | Missionário(a) no campo ou em envio | Auto-cadastro em `/register/missionaries` → confirmação de e-mail → (no back) aprovação de admin | Perfil expandido, agência/comunidade de fé, produção de conteúdo, projetos e campanhas; rede (seguir, feed). |
| `SUPPORTER`  | Apoiador(a) / mantenedor(a)         | Auto-cadastro em `/register/supporters` → confirmação de e-mail; comunidade de fé opcional       | Seguir missionários, acompanhar atualizações e oração, descobrir projetos e apoiar (doações via back).       |
| `ADMIN`      | Equipe / operação                   | Provisionamento interno (sem auto-cadastro no site)                                              | Aprovação de missionários, curadoria e gestão global (painel admin — fora do fluxo público atual).           |

**Visitante (não autenticado):** pode ver a landing e rotas públicas de leitura (ex.: perfil público). Cadastro começa em `/select-role`; login em `/login`.

**🚪 Entrada rápida no app:**

| Ação na UI                     | Destino                                                 |
| ------------------------------ | ------------------------------------------------------- |
| Entrar                         | `/login`                                                |
| Comece agora / escolher perfil | `/select-role` → cadastro do papel                      |
| Esqueci a senha                | `/forgot-password` → e-mail → `/reset-password?token=…` |

---

<a name="estrutura-do-projeto"></a>

## 📂 Estrutura do projeto

Pastas **raiz** e **`src/`** (o que cada uma faz):

| Pasta / arquivo           | Função                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `public/`                 | Assets estáticos servidos na URL (`/images`, logos, badges).                                |
| `src/`                    | Código da aplicação.                                                                        |
| `src/app/`                | Rotas, layouts, metadata e SEO (`sitemap`, `robots`) — App Router do Next.js.               |
| `src/app/actions/`        | Server Actions: todas as mutações (login, logout, cadastro, perfil, catálogos).             |
| `src/app/api/`            | Route handlers de leitura para as ilhas do cliente (sessões, catálogos, username, CEP).     |
| `src/proxy.ts`            | Renova a sessão antes de cada render e protege `/profile/**`.                               |
| `src/components/`         | UI reutilizável e blocos de página (landing, layout, profile, register…).                   |
| `src/forms/`              | Formulários (login, senha, wizards de cadastro).                                            |
| `src/hooks/`              | Hooks de cliente (disponibilidade de username, CEP, preferências).                          |
| `src/lib/`                | Infra compartilhada: chamada à API/BFF, sessão, erros, cache, query client, máscaras.       |
| `src/lib/server/`         | Leituras no servidor (sessão, perfil do dono, perfil público) e helpers das Server Actions. |
| `src/mocks/`              | Dados de exemplo das telas que ainda não têm endpoint (marcados com "Dados de exemplo").    |
| `src/schemas/`            | Schemas Zod de validação (formulários e entrada das Server Actions).                        |
| `src/services/`           | Fachada usada pela UI: chama as Server Actions e as rotas de leitura.                       |
| `src/services/queries/`   | Hooks do TanStack Query das ilhas do cliente.                                               |
| `src/stores/`             | Stores Zustand de estado só do navegador (cadastro, acessibilidade, avisos).                |
| `src/test/`               | Helpers de teste (sessão, query client, fixtures).                                          |
| `src/theme/`              | Tema MUI, tokens de cor e `AppThemeProvider`.                                               |
| `src/types/`              | Tipos TypeScript compartilhados.                                                            |
| `e2e/`                    | Testes Playwright (com axe) e a API falsa usada por eles (`e2e/support/mock-api.mjs`).      |
| `e2e-real/`               | Testes Playwright contra o backend e o banco reais (`pnpm test:e2e:real`).                  |
| `docs/architecture/`      | ADRs do frontend (`decisions/`) e o template.                                               |
| `AGENTS.md` / `CLAUDE.md` | Orientação para IAs no repositório.                                                         |
| `CONTRIBUTING.md`         | Como contribuir (único lugar para branches/commits/PRs).                                    |
| `CODE_OF_CONDUCT.md`      | Código de conduta da comunidade.                                                            |

<details>
  <summary>Árvore (visão geral)</summary>

```
.
├── public/                 # Estáticos (imagens, logos, badges)
├── src/
│   ├── app/                # Rotas (App Router)
│   │   ├── actions/        # Server Actions (mutações)
│   │   ├── api/            # Route handlers de leitura (ilhas do cliente)
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── profile/
│   │   ├── register/       # missionaries / supporters
│   │   ├── reset-password/
│   │   ├── select-role/
│   │   └── user/[username]/
│   ├── components/         # UI por domínio de tela
│   │   ├── common/
│   │   ├── landing/
│   │   ├── layout/
│   │   ├── profile/
│   │   ├── register/
│   │   └── …
│   ├── forms/              # Formulários e steps de cadastro
│   ├── hooks/              # Hooks de cliente
│   ├── lib/                # Infra (api, sessão, erros, cache, query)
│   │   └── server/         # Leituras no servidor
│   ├── mocks/              # Dados de exemplo
│   ├── schemas/            # Zod
│   ├── services/           # Fachada da UI (actions + leituras)
│   ├── stores/             # Zustand (estado só do navegador)
│   ├── test/               # Helpers de teste
│   ├── theme/              # Design system / MUI
│   ├── types/
│   └── proxy.ts            # Renovação de sessão e guarda de rotas
├── e2e/                    # Playwright + API falsa
├── e2e-real/               # Playwright + backend e banco reais
├── docs/architecture/      # ADRs
├── AGENTS.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
└── README.md
```

</details>

---

<a name="arquitetura"></a>

## 🏗️ Arquitetura

O front é **server-first**: os dados chegam prontos no HTML, e o navegador só busca o que muda enquanto o usuário interage. As decisões estão nos ADRs em [`docs/architecture/decisions/`](./docs/architecture/decisions/).

| Peça                                     | Como funciona                                                                                                                                            | ADR        |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Server Components + Cache Components** | Sessão e perfil do dono são lidos no servidor. Páginas públicas usam `'use cache'` com tag por entidade (ex.: `profile:<username>`, 5 min).              | 0005, 0004 |
| **Sessão**                               | Cookies httpOnly. O `proxy.ts` renova o token antes de cada render; o navegador nunca vê o token.                                                        | 0006       |
| **Server Actions**                       | Todas as mutações. Validam a entrada com Zod, chamam a API e devolvem a página já atualizada (`updateTag` + `refresh`).                                  | 0006       |
| **TanStack Query**                       | Só nas "ilhas": trechos interativos que buscam dados no navegador (username disponível, listas do cadastro, sessões ativas).                             | 0002       |
| **Zustand**                              | Só estado que existe no navegador (rascunho do cadastro, preferências de acessibilidade, avisos). Código de servidor não importa stores (regra de lint). | 0003       |
| **Erros da API**                         | A API responde `{ message, code, errors? }`; o front traduz pelo `code` e pelas regras de validação, nunca pelo texto.                                   | —          |

A API é o [MissionApp Backend](https://github.com/MissionAppFaithTech/MissionAppBackend). O servidor do Next fala com ela (`API_URL`); o navegador nunca chama a API direto.

---

<a name="stack"></a>

## ⚙️ Stack

| Camada              | Tecnologia                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Framework           | [Next.js 16](https://nextjs.org/) (App Router)                                                                                       |
| UI                  | [React 19](https://react.dev/)                                                                                                       |
| Linguagem           | [TypeScript](https://www.typescriptlang.org/)                                                                                        |
| Componentes         | [MUI (Material UI) 9](https://mui.com/) + Emotion                                                                                    |
| Estilos utilitários | [Tailwind CSS 4](https://tailwindcss.com/)                                                                                           |
| Formulários         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                                                            |
| Dados no cliente    | [TanStack Query 5](https://tanstack.com/query) (só nas ilhas)                                                                        |
| Estado do navegador | [Zustand](https://zustand.docs.pmnd.rs/)                                                                                             |
| Tema                | [next-themes](https://github.com/pacocoursey/next-themes) + design system próprio                                                    |
| Tipografia          | [DM Sans](https://fonts.google.com/specimen/DM+Sans) via `next/font`                                                                 |
| Testes              | [Vitest](https://vitest.dev/) + Testing Library, [Playwright](https://playwright.dev/) + axe, [Stryker](https://stryker-mutator.io/) |
| Lint / formatação   | ESLint + Prettier 3                                                                                                                  |

---

<a name="pre-requisitos"></a>

## ✔️ Pré-requisitos

- **Node.js** — versão pinada em [`.node-version`](./.node-version) (`26.13.0`, alinhada ao backend).
- **pnpm** — versão fixada em `packageManager` no `package.json` (`12.16.1`; lockfile oficial: `pnpm-lock.yaml`) — mesma família do [MissionApp Backend](https://github.com/MissionAppFaithTech/MissionAppBackend)

> Use **somente pnpm** (via Corepack). Não rode `npm install` / `yarn` neste repositório.

Recomendado: [mise](https://mise.jdx.dev/) (ou outro version manager) para ler `.node-version` automaticamente.

```bash
corepack enable   # passa a usar o pnpm fixado em packageManager
```

> **Idade mínima de pacotes:** o `pnpm-workspace.yaml` define `minimumReleaseAge: 1440`, então só são instaladas versões publicadas há pelo menos 24 h — localmente e no CI. Uma versão mais nova só entra listada em `minimumReleaseAgeExclude`.

---

<a name="instalacao"></a>

## 🚀 Instalação

1. **📥 Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd MissionAppFrontend
   ```

2. **📦 Instale as dependências**

   ```bash
   pnpm install
   ```

3. **🔐 Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env.local
   ```

   | Variável               | Para que serve                                                                                                              |
   | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL` | URL pública do site (links canônicos e SEO). Padrão `http://localhost:3000`.                                                |
   | `API_URL`              | URL da API (sem `/api/v1`). Padrão `http://localhost:3333`.                                                                 |
   | `BFF_SHARED_SECRET`    | Opcional. Mesmo valor da API: repassa o IP real do usuário para os rate limits (ADR-0032 do backend). Nunca `NEXT_PUBLIC_`. |

   Para usar o site de verdade, suba também o [backend](https://github.com/MissionAppFaithTech/MissionAppBackend) na porta `3333`.

4. **▶️ Inicie o servidor de desenvolvimento**

   ```bash
   pnpm dev
   ```

5. **🌐 Abra no navegador**

   [http://localhost:3000](http://localhost:3000)

---

<a name="scripts-disponiveis"></a>

## 💻 Scripts disponíveis

| Comando              | Descrição                                  |
| -------------------- | ------------------------------------------ |
| `pnpm dev`           | App em desenvolvimento                     |
| `pnpm build`         | Build de produção                          |
| `pnpm start`         | Servidor de produção                       |
| `pnpm lint`          | ESLint                                     |
| `pnpm format`        | Formata com Prettier                       |
| `pnpm format:check`  | Verifica formatação sem alterar arquivos   |
| `pnpm typecheck`     | Verifica tipos TypeScript (`tsc --noEmit`) |
| `pnpm test`          | Testes unitários (Vitest)                  |
| `pnpm test:e2e`      | Testes e2e (Playwright, com axe)           |
| `pnpm test:e2e:real` | E2e com o backend e o banco reais          |
| `pnpm test:a11y`     | Só a verificação de acessibilidade (axe)   |
| `pnpm test:mutation` | Testes de mutação (Stryker)                |

---

<a name="testes"></a>

## 🧪 Testes

- **Unitários:** `pnpm test` (Vitest + Testing Library). Server Actions são testadas com o harness de `src/test/actionHarness.ts`.
- **E2e:** `pnpm build && pnpm test:e2e`. O Playwright sobe o app e uma API falsa (`e2e/support/mock-api.mjs`, porta 3335), então a suíte nunca toca uma API real. Roda em desktop e Pixel 5, com axe. Sem Google Chrome, use `PW_BUNDLED_CHROMIUM=1`.
- **E2e com backend real:** `pnpm build && pnpm test:e2e:real`. Precisa do repositório do backend ao lado (`../MissionAppBackend`, ou `MISSIONAPP_BACKEND_DIR`), com o `.env` configurado e a infraestrutura de pé (`just up`). A suíte sobe uma instância isolada do backend na porta 3334, com o banco `app_e2e` recriado por migrations e seeds a cada execução e apagado no fim, e o Next na porta 3100. Ela usa o Redis db 2 e índices de busca próprios (`e2e_*`, recriados a cada execução e apagados no fim), e não sobe os workers das filas, então não manda e-mail. Os seus servidores de dev (3000/3333) e o banco `app` não são tocados. As specs novas que dependem da API ficam em `e2e-real/`; a suíte com a API falsa continua sendo a do CI.
- **Mutação:** `pnpm test:mutation` (escopo em `stryker.config.json`).

Antes de abrir PR: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`, os e2e do fluxo alterado e `pnpm test:e2e:real` (ver [`CONTRIBUTING.md`](./CONTRIBUTING.md)).

---

<a name="rotas-principais"></a>

## 🧭 Rotas principais

| Rota                              | Descrição                                                                |
| --------------------------------- | ------------------------------------------------------------------------ |
| `/`                               | Landing page                                                             |
| `/select-role`                    | Escolha de perfil para cadastro                                          |
| `/register/missionaries`          | Cadastro de missionário                                                  |
| `/register/supporters`            | Cadastro de apoiador                                                     |
| `/login`                          | Entrada na plataforma                                                    |
| `/forgot-password`                | Solicitar link de redefinição                                            |
| `/reset-password`                 | Definir nova senha (link do e-mail)                                      |
| `/profile/sobre`                  | Área do missionário (perfil, "Sobre", projetos, campanha, configurações) |
| `/profile/supporter`              | Área do apoiador                                                         |
| `/user/[username]`                | Perfil público do missionário (dados da API; 404 se não aprovado/ativo)  |
| `/profile/missionario/[username]` | Perfil do missionário visto pelo apoiador                                |
| `/campanha/[id]`                  | Página de campanha (dados de exemplo)                                    |
| `/conselho-missionario`           | Guia do conselho missionário                                             |

---

<a name="identidade-visual"></a>

## 🎨 Identidade visual

O design system usa tons que representam os públicos da plataforma:

- **Azul missionário** — confiança, propósito e identidade principal
- **Azul apoiador** — acolhimento e conexão
- **Laranja mission** — destaque em CTAs e momentos de ação

Tipografia, gradientes e componentes (`PillButton`, `SectionHeader`, `Logo`, etc.) estão centralizados em `src/theme/theme.ts`.

UX, telas e marca (logo, variantes claro/escuro): ver [Links externos](#links-externos).

---

<a name="links-externos"></a>

## 🔗 Links externos

- [Design no Figma](https://www.figma.com/design/uMAwJPYKaEoN7ScjAmgZ6O/Mission-app?node-id=902-1737&t=hALogHv4YSYnn2VE-1)
- [MissionApp Backend](https://github.com/MissionAppFaithTech/MissionAppBackend)

---

<a name="contribuindo"></a>

## 🤝 Contribuindo

Como contribuir (branches, Conventional Commits, lint e PRs): [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Código de Conduta: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

---

<a name="seguranca"></a>

## 🔒 Segurança

Para reportar vulnerabilidades de forma responsável, veja [`SECURITY.md`](./SECURITY.md). **Não** abra issue pública sobre falhas de segurança.

---

<a name="licenca"></a>

## 📄 Licença

Distribuído sob a licença [MIT](./LICENSE.txt). Você pode usar, modificar e distribuir o código conforme os termos da licença.
