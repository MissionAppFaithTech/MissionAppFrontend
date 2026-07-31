# ⛪ Mission App — Frontend

## 📋 Sumário

1. [Visão geral](#visao-geral)
2. [Tipos de acesso](#tipos-de-acesso)
3. [Estrutura do projeto](#estrutura-do-projeto)
4. [Stack](#stack)
5. [Pré-requisitos](#pre-requisitos)
6. [Instalação](#instalacao)
7. [Scripts disponíveis](#scripts-disponiveis)
8. [Rotas principais](#rotas-principais)
9. [Identidade visual](#identidade-visual)
10. [Links externos](#links-externos)
11. [Contribuindo](#contribuindo)
12. [Licença](#licenca)

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

| Papel | Quem é | Como entra | O que faz na plataforma |
| ----- | ------ | ---------- | ----------------------- |
| `MISSIONARY` | Missionário(a) no campo ou em envio | Auto-cadastro em `/register/missionaries` → confirmação de e-mail → (no back) aprovação de admin | Perfil expandido, agência/comunidade de fé, produção de conteúdo, projetos e campanhas; rede (seguir, feed). |
| `SUPPORTER` | Apoiador(a) / mantenedor(a) | Auto-cadastro em `/register/supporters` → confirmação de e-mail; comunidade de fé opcional | Seguir missionários, acompanhar atualizações e oração, descobrir projetos e apoiar (doações via back). |
| `ADMIN` | Equipe / operação | Provisionamento interno (sem auto-cadastro no site) | Aprovação de missionários, curadoria e gestão global (painel admin — fora do fluxo público atual). |

**Visitante (não autenticado):** pode ver a landing e rotas públicas de leitura (ex.: perfil público). Cadastro começa em `/select-role`; login em `/login`.

**🚪 Entrada rápida no app:**

| Ação na UI | Destino |
| ---------- | ------- |
| Entrar | `/login` |
| Comece agora / escolher perfil | `/select-role` → cadastro do papel |
| Esqueci a senha | `/forgot-password` → e-mail → `/reset-password?token=…` |

---

<a name="estrutura-do-projeto"></a>

## 📂 Estrutura do projeto

Pastas **raiz** e **`src/`** (o que cada uma faz):

| Pasta / arquivo | Função |
| --------------- | ------ |
| `public/` | Assets estáticos servidos na URL (`/images`, logos, badges). |
| `src/` | Código da aplicação. |
| `src/app/` | Rotas, layouts, metadata, SEO (`sitemap`, `robots`) e BFF (`app/api`) — App Router do Next.js. |
| `src/components/` | UI reutilizável e blocos de página (landing, layout, profile, register…). |
| `src/forms/` | Formulários (login, senha, wizards de cadastro). |
| `src/lib/` | Utilitários compartilhados (Axios, API/BFF, máscaras, força de senha, site URL). |
| `src/mocks/` | Dados e flags de mock enquanto o backend não está ligado (ex.: auth). |
| `src/schemas/` | Schemas Zod de validação. |
| `src/services/` | Chamadas HTTP / orquestração de auth, username, etc. |
| `src/theme/` | Tema MUI, tokens de cor e `AppThemeProvider`. |
| `src/types/` | Tipos TypeScript compartilhados. |
| `AGENTS.md` / `CLAUDE.md` | Orientação para IAs no repositório. |
| `CONTRIBUTING.md` | Como contribuir (único lugar para branches/commits/PRs). |
| `CODE_OF_CONDUCT.md` | Código de conduta da comunidade. |

<details>
  <summary>Árvore (visão geral)</summary>

```
.
├── public/                 # Estáticos (imagens, logos, badges)
├── src/
│   ├── app/                # Rotas (App Router) + BFF em api/
│   │   ├── api/            # Route handlers (proxy para o backend)
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
│   ├── lib/                # Infra de front (api, axios, masks…)
│   ├── mocks/              # Mocks de desenvolvimento
│   ├── schemas/            # Zod
│   ├── services/           # Camada de serviços HTTP
│   ├── theme/              # Design system / MUI
│   └── types/
├── AGENTS.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
└── README.md
```

</details>

---

<a name="stack"></a>

## ⚙️ Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Componentes | [MUI (Material UI) 9](https://mui.com/) + Emotion |
| Estilos utilitários | [Tailwind CSS 4](https://tailwindcss.com/) |
| Formulários | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| HTTP | [Axios](https://axios-http.com/) |
| Estado | [Zustand](https://zustand.docs.pmnd.rs/) |
| Tema | [next-themes](https://github.com/pacocoursey/next-themes) + design system próprio |
| Tipografia | [DM Sans](https://fonts.google.com/specimen/DM+Sans) via `next/font` |
| Lint / formatação | ESLint + Prettier 3 |

---

<a name="pre-requisitos"></a>

## ✔️ Pré-requisitos

- **Node.js** 20 ou superior
- **Yarn** (lockfile: `yarn.lock`)

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
   yarn install
   ```

3. **🔐 Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env.local
   ```

   Valores padrão em `.env.example` (site em `:3000`, API em `:3333`).

4. **▶️ Inicie o servidor de desenvolvimento**

   ```bash
   yarn dev
   ```

5. **🌐 Abra no navegador**

   [http://localhost:3000](http://localhost:3000)

---

<a name="scripts-disponiveis"></a>

## 💻 Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | App em desenvolvimento |
| `yarn build` | Build de produção |
| `yarn start` | Servidor de produção |
| `yarn lint` | ESLint |
| `yarn format` | Formata com Prettier |
| `yarn format:check` | Verifica formatação sem alterar arquivos |

---

<a name="rotas-principais"></a>

## 🧭 Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/select-role` | Escolha de perfil para cadastro |
| `/register/missionaries` | Cadastro de missionário |
| `/register/supporters` | Cadastro de apoiador |
| `/login` | Entrada na plataforma |
| `/forgot-password` | Solicitar link de redefinição |
| `/reset-password` | Definir nova senha (link do e-mail) |
| `/profile` | Área logada do usuário |
| `/user/[username]` | Perfil público |

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

<a name="licenca"></a>

## 📄 Licença

Distribuído sob a licença [MIT](./LICENSE.txt). Você pode usar, modificar e distribuir o código conforme os termos da licença.
