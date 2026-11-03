# [ADR-0005]: Renderização Server-First com Cache Components

## Dados

- **Status:** 🟢 Aceito
- **Data:** 2026-11-02
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

As páginas do frontend são Server Components só na casca: o conteúdo é client e busca os dados depois de montar.

- O layout do missionário (`src/components/profile/MissionaryProfileLayout.tsx`) reidrata o `profileStore` do `sessionStorage` e chama `fetchProfile()` num `useEffect`, com skeleton até a resposta.
- `Logo`, `useRoleGuard` e menus perguntam ao BFF quem está logado (`/api/auth/session`) depois do primeiro render.
- As páginas públicas usam `export const revalidate`, o modelo de cache anterior ao Next.js 16.

O Next.js 16.4 instalado oferece **Cache Components** (`cacheComponents: true`), que substitui as configs de segmento (`revalidate`, `dynamic`, `fetchCache`) por:

- `use cache` em arquivo, componente ou função, com `cacheTag()` e `cacheLife()`;
- `use cache: private` para dados por usuário: pode ler `cookies()`, mas não é guardado no servidor, só na memória do navegador pelo tempo `stale` (`03-api-reference/01-directives/use-cache-private.md`);
- uma regra estrita: leitura de dados de runtime (`cookies()`, `headers()`, `searchParams`) fora de `use cache` precisa estar sob `<Suspense>`, senão o build falha (`02-guides/authentication-with-cache-components.md`).

Ativar a flag quebra as **9 exportações `revalidate`** atuais (`app/page.tsx`, `campanha/[id]`, `navegacao`, `login`, `conselho-missionario`, `user/[username]`, `register/missionaries`, `register/supporters`, `select-role`).

A questão central é: **como renderizar no servidor as páginas autenticadas e públicas, com cache onde ele cabe, sem tornar a árvore inteira dinâmica?**

## Decisão

Adotar a renderização **server-first** com **Cache Components**.

1. **Ativar `cacheComponents: true`** em `next.config.ts` e migrar as 9 exportações `revalidate` para `'use cache'` + `cacheLife` (perfil custom de 300 s onde era 300; `'hours'` onde era 3600).
2. **Sessão lida no servidor** por `getCurrentUser()` em `src/lib/server/session.ts`:
   - envolvida em `cache()` do React, que deduplica a leitura dentro de uma requisição;
   - **sem** `'use cache: private'`: essa entrada fica na memória do navegador pelo tempo `stale` e continuaria mostrando a sessão anterior logo depois do login ou do logout. Decodificar um cookie é barato, então não há o que ganhar com esse cache;
   - lê o cookie de acesso, já renovado pelo proxy ([ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)), e decodifica `sub` e `role` com `decodeAccessToken`. Isso serve só para decidir a tela: o backend continua autorizando cada chamada.
3. **Compartilhamento da sessão** como promise num contexto (`SessionProvider`), desembrulhada com `use()` nos componentes cliente (`Logo`, menus, guard). A sessão **não** é lida no topo do layout, porque isso seguraria todo o segmento (guia de autenticação, seção sobre layouts). Cada leitura fica numa fronteira `<Suspense>` pequena.
4. **Dados do usuário em componentes dinâmicos sob `<Suspense>`:**
   - o perfil do dono é buscado no servidor (`GET /account/profile` via `backendFetch`) num componente dentro do layout de `app/profile/(missionary)`, com o skeleton atual como fallback;
   - os componentes cliente recebem o perfil por props ou contexto;
   - `mapAccountProfile` (`src/services/profile.service.ts`) continua sendo o mapeador.
5. **Dados compartilhados com `use cache` + `cacheTag`**, conforme o [ADR-0004](./0004-rotas-publicas-com-server-components-e-use-cache.md).
6. **Saem:** o fetch e o snapshot do `profileStore`, o estado do `sessionStore` e as rotas `GET /api/account/profile` e `GET /api/auth/session`, assim que ficarem sem consumidor no cliente.
7. **Migração incremental** com `export const instant = false` nas rotas que ainda não estiverem prontas, como prevê a documentação.

## Justificativa

- **Primeiro paint com dados:** some a sequência "skeleton → fetch → conteúdo" nas páginas autenticadas e o snapshot em `sessionStorage` que existia só para mascarar essa espera.
- **Modelo atual do framework:** `revalidate` e `unstable_cache` foram substituídos por `use cache`; adiar a migração só aumenta o custo.
- **Shell estático preservado:** com `<Suspense>` em volta de cada leitura de sessão ou perfil, o resto da página continua pré-renderizado.
- **Privacidade:** a sessão e o perfil do dono não entram em nenhum cache compartilhado: são lidos a cada requisição, e `cache()` só vale dentro dela.

## Alternativas Consideradas

**1. Manter a busca no cliente (status quo)**

Funciona, mas mantém skeleton em toda página, fetch duplicado entre componentes e estado de servidor em stores. Descartada.

**2. SSR dinâmico sem Cache Components**

Ler cookies em Server Components sem a flag torna as rotas totalmente dinâmicas e mantém o modelo `revalidate`, que está sendo substituído. Descartada.

**3. TanStack Query com hidratação em todas as páginas**

Leva para o cliente um cache que o servidor já oferece. Descartada (ver [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md)).

## Consequências (Trade-offs)

### Positivas / Benefícios

- Páginas do dono renderizam com o perfil no HTML.
- `Logo`, menus e guard sabem o papel do usuário sem pedido extra ao BFF.
- Cache das páginas públicas por tag, com revalidação imediata após edição.

### Negativas / Riscos

- **Migração com quebra de build:** as 9 exportações `revalidate`, leituras fora de `<Suspense>`, `generateStaticParams` vazio e IO síncrono no prerender precisam ser corrigidos de uma vez ao ativar a flag.
- **Depende do refresh no proxy** para que o cookie lido no servidor nunca esteja expirado ([ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)).
- **Curva de aprendizado:** fronteiras `<Suspense>`, as três variantes de `use cache` e a regra de não ler sessão no topo do layout.

## Referências

- Documentação do Next.js instalada: `02-guides/authentication-with-cache-components.md`, `02-guides/migrating-to-cache-components.md`, `03-api-reference/01-directives/use-cache.md`, `use-cache-private.md`
- [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md), [ADR-0003](./0003-escopo-e-convencoes-do-zustand-para-estado-de-cliente.md), [ADR-0004](./0004-rotas-publicas-com-server-components-e-use-cache.md) e [ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)
