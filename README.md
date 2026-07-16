# Mission App

> Conectamos missionários e apoiadores em um só lugar.

Plataforma web **open source** para aproximar quem está no campo missionário e quem envia, ora e sustenta. O Mission App centraliza atualizações, pedidos de oração e relacionamentos — para que a missão avance com mais proximidade, clareza e cuidado.

Contribuições são bem-vindas: issues, sugestões e pull requests ajudam a tornar a ferramenta melhor para toda a comunidade missionária.

---

## Por que existimos

A missão não acontece sozinha. Missionários precisam compartilhar avanços, pedir oração e manter viva a conexão com quem os apoia. Apoiadores querem acompanhar de perto, entender o impacto e participar de forma simples e significativa.

Hoje, muito disso se perde em mensagens soltas, grupos dispersos e ferramentas que não foram feitas para esse propósito. O **Mission App** nasce para resolver isso: um espaço dedicado onde histórias, oração e apoio convivem no mesmo lugar.

**Para missionários**

- Compartilhar atualizações com facilidade  
- Receber apoio em oração  
- Fortalecer a rede de mantenedores  
- Manter todos conectados em um só ambiente  

**Para apoiadores**

- Acompanhar a jornada missionária  
- Receber pedidos de oração  
- Contribuir com mais proximidade  
- Ver o impacto da participação  

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Componentes | [MUI (Material UI) v6](https://mui.com/) + PIGMENT |
| Estilos utilitários | [Tailwind CSS 4](https://tailwindcss.com/) |
| Formulários | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| HTTP | [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) |
| Estado | [Zustand](https://zustand.docs.pmnd.rs/) |
| Tema | [next-themes](https://github.com/pacocoursey/next-themes) + design system próprio |
| Tipografia | [DM Sans](https://fonts.google.com/specimen/DM+Sans) via `next/font` |
| Lint / formatação | ESLint 9 + Prettier 3 |

---

## Pré-requisitos

- **Node.js** 20 ou superior  
- **npm** (ou yarn / pnpm / bun)  
- API backend do Mission App rodando (padrão: `http://localhost:3001`)

---

## Instalação

1. **Clone o repositório**

   ```bash
   git clone <url-do-repositorio>
   cd MissionAppFrontend
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   Crie um arquivo `.env.local` na raiz do projeto:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   Ajuste a URL conforme o ambiente da sua API.

4. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

5. **Abra no navegador**

   Acesse [http://localhost:3000](http://localhost:3000).

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Sobe o app em modo desenvolvimento (Turbopack) |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |
| `npm run format` | Formata o código com Prettier |
| `npm run format:check` | Verifica formatação sem alterar arquivos |

---

## Estrutura do projeto

```
src/
├── app/                    # Rotas e layouts (App Router)
│   ├── login/              # Autenticação
│   ├── select-role/        # Escolha de perfil (missionário / apoiador)
│   ├── profile/            # Perfil do usuário
│   └── user/[username]/    # Perfil público
├── components/             # Componentes reutilizáveis e de página
├── forms/                  # Formulários (ex.: login)
├── services/               # Chamadas à API
├── schemas/                # Validação com Zod
├── theme/                  # Tema MUI e tokens de marca
└── lib/                    # Utilitários (ex.: cliente Axios)
public/                     # Assets estáticos (logos, imagens, badges)
```

---

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/select-role` | Seleção de papel (missionário ou apoiador) |
| `/login` | Entrada na plataforma |
| `/profile` | Área logada do usuário |
| `/user/[username]` | Perfil público |

---

## Identidade visual

O design system usa tons que representam os dois públicos da plataforma:

- **Azul missionário** — confiança, propósito e identidade principal  
- **Azul apoiador** — acolhimento e conexão  
- **Laranja mission** — destaque em CTAs e momentos de ação  

Tipografia, gradientes e componentes (`PillButton`, `SectionHeader`, `Logo`, etc.) estão centralizados em `theme/theme.ts`.

---

## Contribuindo

Este é um projeto open source. Antes de abrir um PR:

1. Abra uma issue para discutir mudanças maiores (opcional, mas recomendado)  
2. Crie uma branch a partir da `main`  
3. Faça suas alterações e rode `npm run lint` e `npm run format:check`  
4. Abra um pull request descrevendo o que mudou e por quê  

Bug reports, ideias de features e melhorias de documentação também são muito valiosos.

---

## Licença

Distribuído sob a licença [MIT](./LICENSE). Você pode usar, modificar e distribuir o código conforme os termos da licença.
