# Integração de postagens

Início: 15/11/2026. Validação final: 17/11/2026. Branch: `feat/integrate-post-crud`.

## Escopo e fontes

Implementação de RF 8.1, RF 8.2, RF 4.2.2, NF 3.1 e NF 6.1, consultados na [especificação de requisitos](https://missionappfaithtech.github.io/MissionAppRequirementsList/).

Contrato conferido no checkout local de MissionAppBackend, commit `639dfc4`: OpenAPI de `post`/`media_asset`, validators de criação/edição/listagem, `PostTransformer`, `PostImageTransformer`, `MediaAssetTransformer`, controllers e paginação por cursor. Nenhum arquivo do backend foi modificado.

A árvore inicial estava limpa em `feature/crud-postagem`, commit `50471aa`, igual a `origin/main`. A implementação está em uma nova branch conforme `CONTRIBUTING.md`. O commit local foi solicitado após a validação; não foram feitos push, merge ou deploy.

## Comportamento entregue

- Feed autenticado: Meu feed envia `missionaryId`; Geral omite o filtro. Paginação usa `meta.nextCursor`/`meta.hasMore`, com até 20 itens por chamada.
- CRUD pelas Server Actions, usando `runWithSession`. Leitura pelo BFF e TanStack Query. Autorização final permanece no backend; nenhum payload permite escolher o autor da criação.
- Antes de editar, consulta `GET /posts/:id`. Editar/excluir são exibidos somente para o missionário dono. Exclusão exige confirmação e só remove a postagem da interface após sucesso da API.
- Legenda obrigatória de até 5000 caracteres; texto simples do `RichTextEditor`, preservando quebras de linha e escapado pelo React. Sem HTML arbitrário.
- `highlightLink` opcional HTTP(S), até 255 caracteres e sem credenciais. Links externos usam `noopener noreferrer`. Embed apenas para hosts e IDs válidos do YouTube, em `youtube-nocookie.com`, carregado por ação do usuário. Shorts, TikTok e Instagram continuam como links.
- Até três imagens JPG/PNG/WebP de 10 MB cada. Prévia local, remoção e estados de envio/processamento/falha. Object URLs são revogadas na remoção e desmontagem.
- Arquivo enviado diretamente para a URL pré-assinada; o BFF recebe apenas metadados. Confirmação ocorre após PUT bem-sucedido. A publicação não espera o worker terminar: assets confirmados em PROCESSING são aceitos. O feed atualiza enquanto há processamento, com polling suspenso em abas de fundo.
- Edição envia `imageAssetIds` com toda a galeria na ordem de seleção. Imagens mantidas não são reenviadas; uploads confirmados também são reutilizados em novas tentativas de salvar.
- Somente `409` com `code=E_POST_IMAGE_LIMIT_REACHED` abre o alerta. Cancelar não repete a requisição. Confirmar repete o payload tentado com `replaceOldestImages=true`. O aviso explica a remoção das imagens antigas e a preservação do texto.
- Loading imediato nas mutações, bloqueio de envios concorrentes, erros associados aos campos e feedbackStore para sucesso/erro. Layout com ações empilhadas no celular e validação a partir de 320 px.

## Arquivos

| Área                        | Arquivos                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contratos e links           | `src/schemas/post.schema.ts`, `src/schemas/content.schema.ts`, `src/lib/postLink.ts`                                                                                                                                                                                                                                                                                                |
| Server Actions              | `src/app/actions/posts.ts`, `src/app/actions/media.ts`                                                                                                                                                                                                                                                                                                                              |
| Leituras BFF                | `src/app/api/posts/route.ts`, `src/app/api/posts/[id]/route.ts`                                                                                                                                                                                                                                                                                                                     |
| Serviços e cache            | `src/services/post.service.ts`, `src/services/mediaUpload.service.ts`, `src/services/profilePicture.service.ts`, `src/services/queries/posts.ts`, `src/lib/query/keys.ts`                                                                                                                                                                                                           |
| Interface                   | `src/app/profile/(missionary)/postagens/page.tsx`, `src/components/posts/PostForm.tsx`, `src/components/posts/PostCard.tsx`, `src/components/common/RichTextEditor.tsx`, `src/components/common/ConfirmDialog.tsx`                                                                                                                                                                  |
| Testes unitários/integração | `src/schemas/post.schema.test.ts`, `src/lib/postLink.test.ts`, `src/app/actions/posts.test.ts`, `src/app/api/posts/route.test.ts`, `src/services/post.service.test.ts`, `src/services/queries/posts.test.tsx`, `src/services/profilePicture.service.test.ts`, `src/components/posts/PostForm.test.tsx`, `src/app/profile/(missionary)/postagens/page.test.tsx`, `src/test/posts.ts` |
| E2E                         | `e2e/posts.spec.ts`, `e2e-real/posts.spec.ts`, `e2e/a11y.spec.ts`, `e2e/support/mock-api.mjs`, `e2e/support/missionary-profile.json`, `playwright.config.ts`, `playwright.real.config.ts`, `e2e-real/support/stack.mjs`                                                                                                                                                             |

O transporte de upload da foto de perfil foi extraído para reutilização; seus testes existentes foram mantidos e adaptados para `credentials: 'omit'`. O diálogo compartilhado ganhou um callback opcional após o fechamento para restaurar o foco do botão que estava desabilitado durante o envio. No editor compartilhado foram acrescentados `required`, `maxLength`, associação do erro via ARIA e foco visível.

## Evidências de integração

O fake backend mantém estado por usuário, registra cada POST/PATCH/DELETE e exige bytes recebidos pelo PUT antes da confirmação. Os E2E inspecionam requisições efetivamente recebidas: três uploads na criação, somente um upload adicional ao substituir uma imagem na edição, IDs mantidos na ordem correta e DELETE após confirmação. Não há interceptação que substitua uma mutação não executada por sucesso.

O cenário do limite parte de 50 imagens em fixtures. Verifica que cancelar não acrescenta requisições, que somente a tentativa autorizada envia `replaceOldestImages`, que o upload não se repete e que os textos antigos permanecem com 50 imagens no total.

Também há cobertura para legenda vazia/5000/5001 caracteres, três/quatro imagens, MIME/tamanho inválidos, upload falho, retomada da confirmação, 403/409/422, sessão ausente, conteúdo inseguro, filtro, paginação, permissões, foco e responsividade.

## Validação e reprodução

Validação com Node 26.13.0, conforme `.node-version`:

| Verificação                                                 | Resultado                                                |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| `pnpm test`                                                 | 187 arquivos e 1306 testes aprovados                     |
| Revalidação dos componentes alterados e polling             | 4 arquivos e 17 testes aprovados                         |
| Playwright: postagens, acessibilidade e foto de perfil      | 112 testes aprovados em Chromium desktop e Mobile Chrome |
| `pnpm typecheck`                                            | Aprovado                                                 |
| ESLint de todos os arquivos TS/TSX/MJS modificados ou novos | Aprovado, sem avisos                                     |
| `pnpm format:check`                                         | Aprovado                                                 |
| `pnpm build`                                                | Aprovado; alertas fora do escopo registrados abaixo      |
| `git diff --check`                                          | Aprovado                                                 |

Após os ajustes de concorrência e UUID v7, os 14 E2E de postagens foram repetidos e aprovados. A suíte real de postagens também passou nos dois projetos: Chromium desktop e Mobile Chrome (15,3 s).

A suíte de acessibilidade inclui a rota de postagens nos temas claro e escuro. O formulário/feed foi testado também em 320 e 1280 px, sem overflow horizontal. Capturas estão em `test-results/posts-owner-filter-cursor--e9726--320px-1280px-accessibility-chromium/posts-320.png` e `posts-1280.png` na mesma pasta. O relatório HTML fica em `playwright-report/index.html` (artefatos locais, ignorados pelo Git).

Com a build pronta, a suíte mockada pode rodar sem reutilizar um servidor de desenvolvimento:

```bash
pnpm typecheck
pnpm test
pnpm format:check
pnpm build
PW_BUNDLED_CHROMIUM=1 E2E_WEB_PORT=3180 BASE_URL=http://localhost:3180 E2E_MOCK_API_PORT=3385 \
  pnpm exec playwright test e2e/posts.spec.ts e2e/a11y.spec.ts e2e/profile-photo.spec.ts --workers=2
```

Neste ambiente, o Chromium precisou das bibliotecas locais já instaladas em `LD_LIBRARY_PATH`. A primeira tentativa sem elas falhou ao carregar `libnspr4.so`; isso foi resolvido na execução seguinte, sem alterar dependências do projeto.

## Validação com backend real — 17/11/2026

**Dois E2E aprovados, sem API mockada**, usando o checkout `639dfc4`, banco `app_e2e`, API em 3334, frontend de produção em 3100, MinIO, Elasticsearch e `node ace queue:workers` ativo junto ao servidor.

Cada execução validou:

- Login com usuário de seed e criação pelo navegador/BFF com legenda, `highlightLink` e três imagens.
- Três PUTs reais para URLs pré-assinadas, confirmação dos uploads e processamento em WebP; a imagem carregada no navegador tinha dimensões válidas.
- Edição mantendo duas imagens na mesma ordem, substituindo a terceira e fazendo somente um PUT adicional. IDs conferidos na resposta real de `GET /posts/:id` e link preservado.
- Remoção assíncrona da imagem substituída: a URL pública passou a responder 404.
- Persistência após recarregar, exclusão com confirmação, GET da postagem respondendo 404 e as três URLs restantes também respondendo 404 após o trabalho do worker.

O seed do backend cria usuários, mas não cria seus registros em `missionaries`. O harness do frontend agora completa exclusivamente as duas fixtures `.test` em `app_e2e`, com agência de seed e UUID v7. A primeira fixture tentou UUID v4: o backend recusou o filtro com 422. O schema do frontend e o fake backend foram alinhados à exigência real de UUID v7; testes de regressão cobrem essa validação em client e Server Actions.

A preparação encontrou limitações locais, resolvidas sem editar o backend: a porta 5432 pertence ao PostgreSQL do Windows, então o container usou 55432; faltavam APP_KEY, JWT_SECRET, REDIS_PASSWORD e RESEND_API_KEY no `.env`, então foram fornecidos valores temporários por ambiente. O Redis do teste ficou em um container separado, na porta 6381; buckets temporários separados receberam as imagens. Não foi configurado envio real de e-mail.

O harness aceita `E2E_REDIS_CONTAINER` e `REDIS_PASSWORD` do ambiente, passa a senha ao Docker sem incluí-la nos argumentos e respeita o Node selecionado no shell, removendo o PATH fixo para Node 24. Os comandos de migração/seed existentes rodaram somente em `app_e2e`; nenhuma migration foi criada.

Ao terminar, foi verificada a remoção de `app_e2e`, dos índices `e2e_*` e das chaves do Redis de teste. Os buckets temporários, incluindo seis objetos restantes de uma tentativa anterior que falhou, e o container Redis separado foram removidos. O arquivo temporário de configuração também foi removido. Arquivos que o Adonis regenerou automaticamente foram restaurados ao estado inicial; `git status --short` do backend ficou vazio.

Relatório local: `playwright-report-real/index.html`. Para repetir com as credenciais e o storage locais configurados, a build pronta e os workers gerenciados pelo harness:

```bash
DB_PORT=55432 PW_BUNDLED_CHROMIUM=1 \
  pnpm exec playwright test -c playwright.real.config.ts e2e-real/posts.spec.ts --workers=2
```

A porta 55432 é específica deste ambiente. A configuração temporária usada nesta validação já foi descartada; o comando exige os valores obrigatórios e buckets válidos no ambiente local.

## Limitações e pendências

- O CRUD e a exclusão assíncrona foram validados com backend real local. Os cenários de 50 imagens, cancelamento/confirmação do limite e erros forçados 403/409/422 continuam cobertos por testes unitários/integração e E2E mockados; não foram exercitados integralmente contra o backend real nesta rodada. Não há validação de produção.
- A API oferece **um único** `highlightLink`; não há campos independentes para link externo, embed e rede social simultâneos. O frontend respeita esse contrato.
- O serializer de posts não contém nome/avatar/username do autor nem existe leitura pública por `missionaryId` no contrato consultado. Postagens próprias usam o perfil carregado; as demais mostram “Missionário” e avatar neutro. Completar essa identificação exige um contrato de dados adicional, sem expor dados privados.
- Geral é a listagem sem filtro. O contrato não oferece filtro por conexões/seguidos.
- O build emite um aviso de prerender de `cookies()` em `/api/auth/sessions`, arquivo fora desta alteração, e termina com sucesso. A causa desse aviso não foi alterada nesta tarefa.

- Na retomada de 17/11, o CLI interrompeu uma build após emitir um alerta de segurança sobre a dependência Next.js 16.4.3. A repetição normal da build terminou com sucesso, sem desativar verificações nem atualizar dependências. O [advisory GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h) classifica o problema como moderado e indica correção em 16.4.5. Uma busca no `src/` não encontrou `unstable_cache`, condição exigida pelo cenário descrito; isso não substitui uma auditoria. A atualização da dependência fica como manutenção separada.
