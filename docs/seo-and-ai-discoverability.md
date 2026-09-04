# Guia de SEO Moderno e Descoberta por IAs (AI SEO & GEO) — Mission App

Este documento detalha a arquitetura, padrões e implementação técnica de **SEO Moderno (Search Engine Optimization)** e **GEO (Generative Engine Optimization / Descoberta por Inteligências Artificiais)** aplicados ao **Mission App Frontend** (Next.js 16, React 19, App Router).

---

## 1. Visão Geral da Estratégia

O cenário de busca contemporâneo divide-se em duas frentes complementares:

1. **Motores de Busca Tradicionais (Google, Bing, Yahoo)**:
   - Foco em rastreabilidade, renderização server-side (SSR), performance web (Core Web Vitals), meta tags precisas, canonicidade e dados estruturados (Schema.org).
2. **Motores de Busca Generativos & IAs (ChatGPT/SearchGPT, Claude, Gemini, Perplexity, Apple Intelligence)**:
   - Foco em densidade de informação factual, manifesto de contexto em linguagem natural (`llms.txt`), marcação de entidades e intenções de ação (`DonateAction`, `ProfilePage`, `Person`), e políticas explícitas de acesso para robôs de IA em `robots.ts`.

---

## 2. Arquitetura de Descoberta por IAs (AI SEO / GEO)

### 2.1 Padrão `llms.txt` e `llms-full.txt`

Inspirado na especificação aberta adotada pelo ecossistema de LLMs (OpenAI, Anthropic, Perplexity, Cursor):

- [`/public/llms.txt`](/public/llms.txt): Resumo conciso em Markdown com a proposta de valor, público-alvo (missionários, apoiadores, igrejas), rotas públicas indexáveis e canais de engajamento (oração, oferta, contato).
- [`/public/llms-full.txt`](/public/llms-full.txt): Base de conhecimento factual expandida com o modelo de entidades (`Person`, `ImpactProject`), contexto do ministério, tecnologias utilizadas e diretrizes de citação para agentes de IA generativa.

### 2.2 Política de Rastreamento em [`robots.ts`](/src/app/robots.ts)

Configuração personalizada para os principais agentes de busca e IAs:

- **SearchGPT & OpenAI**: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`
- **Anthropic Claude**: `ClaudeBot`, `anthropic-ai`
- **Perplexity AI**: `PerplexityBot`
- **Google & Gemini**: `Googlebot`, `Google-Extended`
- **Apple Intelligence**: `Applebot`, `Applebot-Extended`

_Rotas privadas (`/profile`, `/api/`) permanecem estritamente bloqueadas para proteger a privacidade dos usuários._

---

## 3. Dados Estruturados (Schema.org & JSON-LD)

Implementado através do componente modular [`JsonLd`](/src/components/seo/JsonLd.tsx):

### 3.1 Nível Raiz / Layout Global ([`layout.tsx`](/src/app/layout.tsx))

- **`Organization`**:
  - Nome: `Mission App`
  - Mantenedor: `FaithTech`
  - Logo oficial, descrição e campos `knowsAbout` (Missões Cristãs, Projetos Sociais, Apoio a Missionários).
- **`WebSite`**:
  - Identificador canônico do site e idioma (`pt-BR`).

### 3.2 Páginas Públicas de Missionários ([`/user/[username]`](/src/app/user/[username]/page.tsx))

- **`ProfilePage`**:
  - Contextualiza que a página representa um perfil público de usuário.
- **`Person`**:
  - Nome completo, username, ocupação (`jobTitle`), biografia (`description`), cidade de origem (`homeLocation`), atuação no campo (`workLocation`), e afiliações (`memberOf` com comunidade de fé e agência missionária).
- **`Project` & `DonateAction`**:
  - Descreve o Projeto de Impacto ativo do missionário, metas e ação direta de doação (`potentialAction: DonateAction`).
- **`VideoObject`**:
  - Metadados do vídeo do YouTube incorporado para indexação rica de vídeo nos resultados de busca.

---

## 4. Meta Tags, OpenGraph e Twitter Cards

### 4.1 Configurações Globais no [`layout.tsx`](/src/app/layout.tsx)

- `metadataBase`: Configurado dinamicamente para garantir que todas as URLs relativas sejam resolvidas com a origem canônica.
- `title.template`: `%s | Mission App`
- `openGraph`: Imagem de compartilhamento em alta resolução (1200x630), tipo `website`, idioma `pt_BR`.
- `twitter`: Card do tipo `summary_large_image`.
- `robots`: Diretrizes explícitas `index: true`, `follow: true`, `max-image-preview: 'large'`, `max-video-preview: -1`, `max-snippet: -1`.
- `alternates`: Link canônico (`/`) e declaração de idiomas (`languages: { 'pt-BR': '/' }`).

### 4.2 Páginas de Perfil Dinâmicas

- Geração dinâmica de título (`Samuel Mendonça (@_SamiMendonca) | Mission App`).
- Descrição personalizada extraída da bio e ministério do missionário.
- OpenGraph do tipo `profile` com imagem de capa/banner do projeto de impacto.

---

## 5. Sitemap Dinâmico e PWA Manifest

- **Sitemap ([`sitemap.ts`](/src/app/sitemap.ts))**:
  - Mapeia todas as páginas públicas com `changeFrequency`, `priority` e extensões de imagem (`images`).
- **Manifest PWA ([`manifest.ts`](/src/app/manifest.ts))**:
  - Facilita a instalação em dispositivos móveis e melhora o ranqueamento nos mecanismos de busca mobile e assistentes inteligentes.

---

## 6. Checklist de Manutenção Contínua

1. **Ao criar novas rotas públicas**: Adicionar a rota em [`sitemap.ts`](/src/app/sitemap.ts) com a respectiva prioridade.
2. **Ao adicionar novas entidades**: Estender os geradores de schema em [`JsonLd.tsx`](/src/components/seo/JsonLd.tsx).
3. **Novas agências/parceiros**: Atualizar referências no [`public/llms-full.txt`](/public/llms-full.txt).

---

## 7. Estratégia de Testes Automatizados (SEO & GEO)

Para garantir paridade com as especificações oficiais do Schema.org, Google Search Central e agentes de IA generativa, foram integradas suítes de testes automatizados com bibliotecas padrão da indústria:

### 7.1 Validação Estrutural com `schema-dts`

- Arquivo: [`src/components/seo/schema-dts-validation.test.ts`](/src/components/seo/schema-dts-validation.test.ts)
- Utiliza a biblioteca oficial [`schema-dts`](https://www.npmjs.com/package/schema-dts) (definições completas do Schema.org para TypeScript) para validar que os dados gerados de `Organization`, `WebSite`, `ProfilePage`, `Person`, `Project` e `DonateAction` respeitam 100% da tipagem estrita de entidades Schema.org.

### 7.2 Análise de Metadados e Tags SSR com `cheerio`

- Arquivo: [`src/app/seo-metadata.test.ts`](/src/app/seo-metadata.test.ts)
- Simula crawlers e robôs de busca utilizando [`cheerio`](https://www.npmjs.com/package/cheerio) para inspecionar tags `<head>`, `og:image`, `og:title`, `twitter:card`, canônicos e tags de dados estruturados geradas pelo Next.js App Router.

### 7.3 Verificação de Arquivos de Infraestrutura GEO

- Arquivo: [`src/app/seo-geo-files.test.ts`](/src/app/seo-geo-files.test.ts)
- Valida o conteúdo e formatação de `/robots.txt` (diretrizes para `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`), `/sitemap.xml`, `/manifest.webmanifest`, `/llms.txt` e `/llms-full.txt`.

### 7.4 Testes End-to-End (E2E) com Playwright

- Arquivo: [`e2e/seo-geo.spec.ts`](/e2e/seo-geo.spec.ts)
- Executa testes em navegador Chromium real (desktop e mobile) verificando a extração em tempo de execução das tags de metadados, scripts JSON-LD, rotas estáticas e endpoints de LLM com status HTTP 200.
