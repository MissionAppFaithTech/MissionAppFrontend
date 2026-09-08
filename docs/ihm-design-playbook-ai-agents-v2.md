# Playbook de Design de IHM para Agentes de IA: Desenvolvendo Interfaces Front-End com Propósito e Rigor Técnico

Este documento serve como um **guia prático de engenharia de interface e qualidade da interação** para agentes de Inteligência Artificial focados em desenvolvimento Front-End. Ele converte teorias acadêmicas e padrões internacionais em regras acionáveis e estruturadas.

---

## 1. Usabilidade e Heurísticas de Interface

### Heurísticas de Nielsen (Visabilidade, Correspondência, Liberdade, Consistência, Erros e Ajuda)

As heurísticas de usabilidade são regras gerais de design de interface que garantem eficiência, aprendizado rápido e satisfação do usuário.

#### 1.1 Visibilidade do Estado do Sistema

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Visibility of System Status" para obter as especificações completas dos padrões oficiais.
- **Princípio:** A interface deve manter o usuário informado em tempo real sobre o que está acontecendo por meio de feedback imediato e apropriado.
- **Regra:** Sempre que houver uma requisição que consuma processamento ou requeira tempo, exiba um indicador visual correspondente à latência (ex: barra de progresso ou spinner).
- **Exemplo:** Exibir uma barra de progresso ativa indicando a porcentagem de upload (ex: "265 de 763KB carregados - 51 segundos restantes").
- **Erro a evitar:** Iniciar uma ação de background (como processar dados) sem qualquer alteração na interface, deixando a tela estática.

#### 1.2 Correspondência com o Mundo Real

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Match Between System and Real World" para obter as especificações completas dos padrões oficiais.
- **Princípio:** O sistema deve falar a linguagem do usuário, utilizando palavras, expressões e conceitos familiares, seguindo convenções naturais e lógicas.
- **Regra:** Mapeie as operações do banco de dados para metáforas físicas inteligíveis pelo usuário (ex: usar "Lixeira" para deletar arquivos ou "Pasta" para diretórios).
- **Exemplo:** Usar o termo "Mover para Lixeira" para exclusão temporária, e ícones representativos (como notas musicais para faixas e cartazes para filmes).
- **Erro a evitar:** Exibir flags numéricas puras ou jargões técnicos do desenvolvedor (ex: "Flag 1, Flag 11" ou erros SQL crus como "Erro no parser de sintaxe").

#### 1.3 Controle e Liberdade do Usuário

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - User Control and Freedom" para obter as especificações completas dos padrões oficiais.
- **Princípio:** O usuário frequentemente executa ações por engano e precisa de uma saída de emergência clara e de fácil acesso para reverter estados indesejados.
- **Regra:** Toda modal ou fluxo sequencial deve conter um botão explícito de cancelamento, e todas as ações críticas devem suportar o comando "Desfazer" (Undo).
- **Exemplo:** Um formulário de busca ou criação de conta com botões explícitos e distintos para "Enviar" e "Cancelar".
- **Erro a evitar:** Criar fluxos obrigatórios sem botão de saída ou fechar janelas forçando o usuário a reiniciar o aplicativo para abandonar uma tela.

#### 1.4 Consistência e Padronização

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Consistency and Standards" para obter as especificações completas dos padrões oficiais.
- **Princípio:** O usuário não deve ter que adivinhar se palavras, situações ou ações diferentes significam a mesma coisa. Siga padrões estabelecidos pela plataforma (Jakob's Law).
- **Regra:** Mantenha a mesma paleta de cores para elementos interativos idênticos e use padrões reconhecidos de interface do sistema operacional hospedeiro.
- **Exemplo:** Manter menus de navegação superior consistentes em todas as páginas com a mesma tipografia e o mesmo comportamento.
- **Erro a evitar:** Mudar o comportamento de botões ou usar cores arbitrárias fora do padrão do sistema operacional (ex: botão de confirmação verde em uma tela e roxo neon em outra).

#### 1.5 Prevenção de Erros

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Error Prevention" para obter as especificações completas dos padrões oficiais.
- **Princípio:** O design deve, prioritariamente, evitar que o erro ocorra, em vez de apenas exibir boas mensagens de erro após o fato.
- **Regra:** Desabilite ou remova ações inválidas para o contexto atual do usuário por meio de restrições de sistema antes de permitir a submissão.
- **Exemplo:** Desabilitar o botão de "Criar Conta" até que o usuário preencha o campo de e-mail com um formato válido de e-mail, ou desabilitar botões de navegação inválidos.
- **Erro a evitar:** Permitir que o usuário clique em um botão de confirmação com dados incompletos e depois exibir um alerta punitivo em vermelho.

#### 1.6 Reconhecimento em Vez de Memorização

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Recognition Rather than Recall" para obter as especificações completas dos padrões oficiais.
- **Princípio:** Minimize a carga de memória do usuário tornando objetos, ações e opções visíveis e facilmente acessíveis na interface.
- **Regra:** Nunca exija que o usuário se lembre de dados digitados em passos anteriores para avançar no fluxo. Exiba resumos visuais ou preenchimento automático.
- **Exemplo:** Exibir uma pré-visualização de fontes em seu formato real no menu suspenso para que o usuário escolha visualmente a tipografia, ou uma lista de comandos comuns à vista.
- **Erro a evitar:** Forçar o usuário a digitar comandos complexos ou memorizar passos de navegação (ex: ordenar uma tabela por meio de um comando escondido no menu geral de tabelas sem pista visual).

#### 1.7 Flexibilidade e Eficiência de Uso

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Flexibility and Efficiency of Use" para obter as especificações completas dos padrões oficiais.
- **Princípio:** O design deve acomodar tanto usuários novatos quanto experientes, permitindo atalhos de teclado e aceleradores ocultos.
- **Regra:** Inclua teclas de atalho documentadas e atalhos de toque que acelerem as tarefas rotineiras de usuários avançados sem atrapalhar os iniciantes.
- **Exemplo:** Oferecer atalhos universais como `Ctrl + N` para novas janelas e `Space` para entrada rápida em campos de formulários.
- **Erro a evitar:** Forçar usuários frequentes a clicarem em múltiplos passos repetitivos sem oferecer opções de atalho ou macros.

#### 1.8 Projeto Estético e Minimalista

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Aesthetic and Minimalist Design" para obter as especificações completas dos padrões oficiais.
- **Princípio:** Os diálogos não devem conter informações irrelevantes ou raramente necessárias; cada unidade extra de informação diminui a visibilidade do que é importante.
- **Regra:** Limite as informações na tela às necessidades imediatas da tarefa corrente do usuário. Use menus suspensos ou links de divulgação progressiva para ocultar configurações avançadas.
- **Exemplo:** Uma página inicial de busca limpa com apenas o campo de entrada e o botão de ação, ocultando opções avançadas de pesquisa sob um link expansível.
- **Erro a evitar:** Adicionar widgets decorativos que consomem espaço sem utilidade prática ou excesso de painéis em uma única visualização.

#### 1.9 Ajuda aos Usuários para Erros

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Help Users Recognize, Diagnose, and Recover from Errors" para obter as especificações completas dos padrões oficiais.
- **Princípio:** As mensagens de erro devem ser expressas em linguagem clara, sem códigos crípticos, apontando o problema exato e sugerindo soluções construtivas.
- **Regra:** Forneça mensagens de erro contextualizadas no campo que falhou, usando texto vermelho legível e sugerindo uma ação corretiva imediata.
- **Exemplo:** Se o e-mail estiver inválido, exibir em vermelho logo abaixo do campo: "O e-mail fornecido não parece ser válido. Verifique se digitou o caractere '@'".
- **Erro a evitar:** Exibir janelas pop-up com códigos de erro internos inacessíveis ao usuário final (ex: "Ocorreu um erro: Error -1264" ou "SYNTAX ERROR").

#### 1.10 Ajuda e Documentação

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Help and Documentation" para obter as especificações completas dos padrões oficiais.
- **Princípio:** Embora seja melhor que o sistema possa ser usado sem documentação, pode ser necessário fornecer ajuda focada na tarefa do usuário.
- **Regra:** Disponibilize dicas contextuais ao focar em elementos de dados específicos ou caixas de busca de acesso rápido ao conteúdo informativo.
- **Exemplo:** Exibir dicas flutuantes (tooltips) explicando o que o sistema gráfico SmartArt realiza ao passar o mouse sobre o botão.
- **Erro a evitar:** Colocar um botão de ajuda genérico que direciona para um documento PDF imenso de 200 páginas sem índice ou busca interna.

---

### As 8 Regras de Ouro de Ben Shneiderman

- **Diretriz de Pesquisa:** Pesquise na internet por "Jakob Nielsen 10 Usability Heuristics - Help and Documentation" para obter as especificações completas dos padrões oficiais.

#### 1.11 Lute pela Consistência

- **Regra:** Garanta que o fluxo de telas e sequências de ações usem o mesmo vocabulário em prompts, menus e ajuda. Mantenha a ordenação lógica dos argumentos idêntica.
- **Exemplo:** Se o botão para confirmar em um fluxo é "Continuar", use o mesmo rótulo nas telas subsequentes, em vez de alternar para "Avançar" ou "Prosseguir".
- **Erro a evitar:** Trocar termos que executam ações idênticas ao longo do aplicativo (ex: alternar aleatoriamente entre "Procurar", "Pesquisar", "Buscar" e "Query").

#### 1.12 Ofereça Atalhos para Usuários Frequentes

- **Regra:** Implemente aceleradores baseados em combinações de teclas para reduzir o tempo de execução de tarefas frequentes.
- **Exemplo:** Fornecer suporte a `Cmd + C` para copiar e comandos rápidos de preenchimento ou seleção automática.
- **Erro a evitar:** Impedir que o usuário utilize o teclado para submeter um formulário ou forçá-lo a usar o mouse para selecionar todos os campos.

#### 1.13 Dê Feedback Informativo

- **Regra:** Para cada ação menor ou frequente, exiba feedback visual sutil; para ações maiores, exiba respostas proeminentes e estruturadas.
- **Exemplo:** Mudar o estado de foco e preenchimento de um campo de busca ao ser ativado pelo usuário, aplicando uma borda azul ou realce visual.
- **Erro a evitar:** Clicar em um botão e não haver alteração visual instantânea na interface, levando o usuário a clicar repetidamente por achar que o clique falhou.

#### 1.14 Dê Fechamento aos Diálogos

- **Regra:** Organize os fluxos de tarefas em sequências com início, meio e fim claros, culminando em uma página de confirmação.
- **Exemplo:** Exibir uma tela de resumo com os dados de voo e uma mensagem de confirmação final, gerando alívio cognitivo ao finalizar a compra.
- **Erro a evitar:** Concluir um pagamento ou cadastro de formulário extenso e redirecionar imediatamente o usuário para a página inicial em branco sem qualquer mensagem de sucesso.

#### 1.15 Dê Sensação de Controle ao Usuário

- **Regra:** Deixe claro que o usuário é o iniciador e controlador do fluxo das ações, impedindo que o sistema tome decisões invasivas e inesperadas sem seu consentimento.
- **Exemplo:** O usuário inicia e comanda a exportação ou filtragem de uma planilha por meio de botões claros sob sua custódia, em vez de automatizar ações de modificação sem seu comando.
- **Erro a evitar:** Fazer com que o sistema mude o contexto da tela de forma automática apenas ao focar o cursor sobre um campo.

---

### Princípios de Design de Don Norman

- **Diretriz de Pesquisa:** Pesquise na internet por "Ben Shneiderman Eight Golden Rules - Support internal locus of control" para obter as especificações completas dos padrões oficiais.

#### 1.16 Redução de Abismos (Execução e Avaliação)

- **Regra:** Desenvolva elementos de interface que permitam ao usuário traduzir suas intenções em ações físicas rápidas (Abismo da Execução) e decodificar as respostas do sistema instantaneamente (Abismo da Avaliação).
- **Exemplo:** Disponibilizar uma lixeira física para exclusão e, ao arrastar um arquivo nela, exibir o ícone com papéis amassados e uma mensagem sutil.
- **Erro a evitar:** Ocultar botões de edição ou configurações atrás de interações invisíveis e gestos de arrasto complexos que não comunicam seu estado final.

#### 1.17 Affordances e Significantes Claros

- **Regra:** Toda possibilidade física de interação na tela (affordance) deve ser explicitada por meio de um indicador visual nítido (significante).
- **Exemplo:** Adicionar sombras, bordas e efeitos tridimensionais a botões para salientar que são clicáveis, e adicionar rótulos textuais aos ícones.
- **Erro a evitar:** Criar abas ou links textuais sem sublinhado ou bordas que se parecem exatamente com textos informativos comuns (Falsa Affordance).

---

## 2. UX e Psicologia Cognitiva Aplicada

### Leis de Gestalt aplicadas ao Design

- **Diretriz de Pesquisa:** Pesquise na internet por "Don Norman Affordance and Signifier - The Design of Everyday Things" para obter as especificações completas dos padrões oficiais.

#### 2.1 Princípio de Proximidade

- **Regra:** Entidades visuais próximas entre si são percebidas como um grupo. Deixe espaçamentos brancos estratégicos maiores entre tópicos distintos do que entre rótulos e seus respectivos campos.
- **Exemplo:** O rótulo "Nome" e o campo de texto de entrada devem estar separados por apenas 8 pixels de distância. O próximo grupo ("E-mail") deve vir no mínimo 20 pixels abaixo.
- **Erro a evitar:** Espaçar rótulos e inputs de forma uniforme, fazendo com que o input do nome pareça mais próximo do rótulo do e-mail.

#### 2.2 Princípio de Região Comum

- **Regra:** Itens dentro de uma borda visual ou de um fundo colorido de contraste são percebidos como relacionados, facilitando o agrupamento mental.
- **Exemplo:** Usar uma caixa ou plano de fundo cinza sutil para agrupar categorias de produtos ou cartões de dados específicos.
- **Erro a evitar:** Misturar cartões de controle diferentes em um único plano de fundo uniforme e uniforme sem demarcação visual.

---

### Leis Cognitivas Físicas e Decisórias

#### 2.3 Lei de Fitts (Fitts's Law)

- **Diretriz de Pesquisa:** Pesquise na internet por "Fitts's Law in Human-Computer Interaction and UI Button Sizing" para obter as especificações completas dos padrões oficiais.
- **Princípio:** O tempo para atingir um alvo é proporcional à sua distância e inversamente proporcional ao seu tamanho.
- **Regra:** Elementos de controle primários e frequentes (ex: botões de conversão e confirmação) devem possuir grandes áreas de clique e estar posicionados em locais de acesso fácil de cursor ou dedo.
- **Exemplo:** Colocar a barra de menus do aplicativo ou ações primárias ancoradas no topo ou na base da tela, estendendo o hit-target até a borda invisível infinita da tela.
- **Erro a evitar:** Posicionar pequenos links de exclusão ou envio de dados com áreas de clique reduzidas (ex: menos de 24px) próximas ao canto mais difícil da tela.

#### 2.4 Lei de Hick-Hyman (Hick's Law)

- **Diretriz de Pesquisa:** Pesquise na internet por "Hick's Law Decision Making Time and Choice Overload in UX" para obter as especificações completas dos padrões oficiais.
- **Princípio:** O tempo que leva para tomar uma decisão aumenta com a quantidade de opções e a complexidade das alternativas oferecidas.
- **Regra:** Em vez de exibir 20 campos ou escolhas de uma vez, filtre as opções ou exiba-as progressivamente de forma segmentada ou categorizada.
- **Exemplo:** Agrupar opções de busca por categoria em abas específicas ou simplificar formulários extensos em etapas com preenchimento assistido.
- **Erro a evitar:** Exibir menus com centenas de opções dispersas e sem agrupamento, forçando o usuário a ler toda a tela.

#### 2.5 Lei de Miller (Miller's Law - $7 \pm 2$)

- **Diretriz de Pesquisa:** Pesquise na internet por "Miller's Law Human Short-term Memory Limit 7 Plus or Minus 2 Chunking" para obter as especificações completas dos padrões oficiais.
- **Princípio:** A memória de curto prazo de um ser humano adulto é limitada e retém aproximadamente $7 \pm 2$ "chunks" (unidades) de informação.
- **Regra:** Desenhe menus principais com no máximo 7 categorias para evitar sobrecarga cognitiva.
- **Exemplo:** O menu superior de um e-commerce contendo exatamente 5 itens principais ordenados por importância (ex: "Início", "Categorias", "Promoções", "Pedidos", "Contato").
- **Erro a evitar:** Exibir menus horizontais com 15 a 20 links de mesmo peso e tamanho, forçando o usuário a realizar varreduras exaustivas.

---

### O Favo de Mel da Experiência (Morville Honeycomb)

- **Diretriz de Pesquisa:** Pesquise na internet por "Miller's Law Human Short-term Memory Limit 7 Plus or Minus 2 Chunking" para obter as especificações completas dos padrões oficiais.
- **Princípio:** A experiência do usuário de um produto digital deve equilibrar sete fatores essenciais: Útil, Utilizável, Desejável, Encontrável, Acessível, Crível e Valioso.

#### 2.6 Fator Crível (Credibility)

- **Regra:** A interface deve transmitir segurança, confiabilidade, integridade de dados e profissionalismo visual imediato ao usuário.
- **Exemplo:** Incluir políticas claras de proteção e criptografia de dados à vista do usuário ao cadastrar senhas pessoais.
- **Erro a evitar:** Apresentar logos distorcidos, erros gramaticais ou ausência de certificados de segurança que geram suspeita e reduzem a confiança.

---

## 3. Hierarquia Visual, Layout/Grid, Espaçamento e Tipografia

### 3.1 Alinhamento e Espaçamentos do Grid

- **Diretriz de Pesquisa:** Pesquise na internet por "Apple Human Interface Guidelines - Layout, spacing, and grids standard" para obter as especificações completas dos padrões oficiais.
- **Regra:** Todos os controles devem estar alinhados em grades consistentes. Alinhe os rótulos à direita (com dois pontos) e alinhe os campos de entrada à esquerda de forma que iniciem exatamente na mesma linha vertical.
- **Exemplo:**
  - Margem interna de janelas/painéis: 20 pixels de espaçamento padrão.
  - Distância entre controles adjacentes: 8 pixels.
  - Espaçamento uniforme acima e abaixo de divisores visuais: 12 pixels.
- **Erro a evitar:** Criar grids onde os campos de entrada de formulários começam em colunas visuais desalinhadas e as margens laterais esquerda/direita são desiguais.

### 3.2 Escaneamento Visual (F-Shape Pattern)

- **Diretriz de Pesquisa:** Pesquise na internet por "Nielsen Norman Group - F-Shaped Pattern for Reading Web Content" para obter as especificações completas dos padrões oficiais.
- **Regra:** Em visualizações desktop, coloque as informações e ações mais críticas no topo e na porção esquerda da tela, correspondendo ao padrão natural de leitura em "F".
- **Exemplo:** Posicionar o menu lateral de pastas ou lista de e-mails à esquerda e a janela de leitura detalhada no centro-direita.
- **Erro a evitar:** Colocar botões de ação cruciais apenas na base da tela à extrema direita sem indicação prévia, forçando o usuário a realizar varreduras complexas.

### 3.3 Tipografia e Legibilidade

- **Diretriz de Pesquisa:** Pesquise na internet por "W3C Web Content Accessibility Guidelines (WCAG) 2.0 - Tipografia and legibility" para obter as especificações completas dos padrões oficiais.
- **Regra:** Mantenha fontes anti-aliadas e legíveis. Use tipografia padrão da plataforma e evite textos em caixa alta (All-Caps) para blocos de leitura (All-Caps reduz a velocidade de leitura em 13%).
- **Exemplo:**
  - Fonte padrão para listas/tabelas: Lucida Grande Regular 12pt.
  - Fontes para cabeçalhos e rótulos de controle: Lucida Grande Bold.
  - Line spacing (leading) de no mínimo 1.5 dentro de parágrafos.
- **Erro a evitar:** Usar fontes decorativas de baixa resolução para corpo de texto ou justificar textos (alinhados de ambos os lados simultaneamente), o que dificulta o rastreamento ocular de pessoas com dislexia.

---

## 4. Cores e Contraste

### 4.1 Contraste de Texto (WCAG)

- **Diretriz de Pesquisa:** Pesquise na internet por "W3C WCAG 2.0 Success Criterion 1.4.3 Contrast Minimum Level AA and AAA requirements" para obter as especificações completas dos padrões oficiais.
- **Regra:** O contraste entre o texto em primeiro plano e a cor de fundo deve seguir os padrões mínimos testáveis da W3C para visualização.
- **Exemplo:**
  - **Level AA (Mínimo):** Razão de contraste mínima de **4.5:1** para texto normal e **3:1** para textos grandes (acima de 18pt ou 14pt em negrito).
  - **Level AAA (Aprimorado):** Razão de contraste mínima de **7:1** para texto normal e **4.5:1** para textos grandes.
- **Erro a evitar:** Colocar texto amarelo claro sobre fundo branco ou letras cinzas em fundo cinza escuro, inviabilizando a leitura de usuários com baixa visão.

### 4.2 Codificação de Cor e Daltonismo

- **Diretriz de Pesquisa:** Pesquise na internet por "W3C WCAG 2.0 Success Criterion 1.4.1 Use of Color and Accessible Design for Color Blindness" para obter as especificações completas dos padrões oficiais.
- **Regra:** Nunca transmita informações ou estados críticos de sistema usando unicamente a cor. Forneça um significante textual ou de ícone secundário redundante.
- **Exemplo:** Se um campo falhou na validação, pinte a borda de vermelho **E** adicione um ícone de aviso de erro visual acompanhado de um rótulo de texto explicativo (ex: "E-mail inválido").
- **Erro a evitar:** Padrões onde apenas a mudança de cor do texto (ex: de preto para verde ou vermelho) indica se um item está pago ou pendente, deixando usuários com daltonismo impossibilitados de distinguir.

### 4.3 Saturação e Fadiga Visual

- **Diretriz de Pesquisa:** Pesquise na internet por "Visual fatigue and strongly saturated colors in digital screen design" para obter as especificações completas dos padrões oficiais.
- **Regra:** Evite aplicar cores altamente saturadas (puras e vivas) de forma predominante nos fundos e áreas extensas das telas, pois causam exaustão na retina.
- **Exemplo:** Use tons neutros ou pastéis para a maior parte da interface de fundo, reservando cores vivas e quentes (como vermelho) apenas para destacar erros, alertas e exclusões perigosas.
- **Erro a evitar:** Posicionar texto azul saturado diretamente sobre fundo vermelho brilhante, o que força o músculo ocular a tentar refocar de forma contínua.

---

## 5. Botões, CTAs e Formulários

### 5.1 Hierarquia de Botões e CTAs

- **Diretriz de Pesquisa:** Pesquise na internet por "Apple Human Interface Guidelines - Buttons visual hierarchy and CTA design" para obter as especificações completas dos padrões oficiais.
- **Regra:** Mantenha uma hierarquia visual restrita e separada de botões. Afaste botões de ações destrutivas (ex: "Deletar") para longe de botões de ações seguras para evitar cliques acidentais (deixe no mínimo 12 a 16 pixels entre botões adjacentes).
- **Exemplo:**
  - **Ação Primária:** Botão preenchido ou com realce visual expressivo.
  - **Ação Secundária:** Botão contornado (outlined) ou sem borda sutil.
- **Erro a evitar:** Colocar um botão de "Deletar Conta" colado ao lado do botão "Salvar Configurações" com a mesma cor e o mesmo peso visual.

### 5.2 Layout de Formulários

- **Diretriz de Pesquisa:** Pesquise na internet por "Best practices for web form layout, vertical field stacking, and labels" para obter as especificações completas dos padrões oficiais.
- **Regra:** Posicione múltiplos campos de dados em um arranjo vertical empilhado de forma a facilitar o fluxo natural dos olhos.
- **Exemplo:** Exibir as bordas e os limites de preenchimento dos campos de entrada através de caixas de entrada retangulares nítidas para antecipar o tamanho do texto.
- **Erro a evitar:** Posicionar múltiplos inputs e rótulos de forma desalinhada horizontalmente em uma mesma linha sem espaçamento suficiente, misturando onde começa um input e onde termina o rótulo do seguinte.

### 5.3 Validação de Dados na Submissão

- **Diretriz de Pesquisa:** Pesquise na internet por "Inline validation vs Submit validation in form UX design Apple HIG" para obter as especificações completas dos padrões oficiais.
- **Regra:** Não exiba marcas de aviso de campo obrigatório (como asteriscos de alerta) antes que o usuário tente preencher ou enviar. Permita que o usuário explore a interface livremente e, ao tentar sair ou enviar ("Continuar"), destaque apenas os campos inválidos.
- **Exemplo:** O formulário inicia limpo. Ao clicar em "Salvar", se o campo "CPF" estiver vazio, a interface bloqueia o avanço, exibe a borda do CPF em vermelho e uma legenda explicativa sutil.
- **Erro a evitar:** Colocar dezenas de asteriscos vermelhos ao lado de todos os campos da tela assim que ela é aberta, poluindo a visualização.

---

## 6. Feedback e Estados de Componentes

### 6.1 Os Estados do Componente

- **Diretriz de Pesquisa:** Pesquise na internet por "Google Material Design 3 Interaction States (Hover, Focus, Active, Selected, Disabled)" para obter as especificações completas dos padrões oficiais.
- **Regra:** Garanta estados visuais distintos e interativos para cada componente clicável de forma a responder dinamicamente às ações do usuário: Normal, Hover, Focus, Active, Selected e Disabled.
- **Exemplo:**
  - **Normal:** Estado padrão do botão.
  - **Focus / Hover:** Mudar a cor de preenchimento de forma sutil e exibir o ponteiro de seleção apropriado ao focar pelo teclado ou passar o mouse.
  - **Disabled:** Botão esmaecido e opaco, inibindo cliques físicos e ignorado por leitores de tela.
- **Erro a evitar:** Manter botões inativos com o mesmo estilo visual de botões ativos, induzindo o usuário a clicar neles repetidamente.

### 6.2 Indicadores de Progresso de Acordo com a Duração (Feedback Dinâmico)

- **Diretriz de Pesquisa:** Pesquise na internet por "Apple Human Interface Guidelines progress indicators and Jakob Nielsen's Response Time limits" para obter as especificações completas dos padrões oficiais.
- **Regra:** Forneça feedbacks visuais específicos e adequados com base na latência e no tempo estimado de duração do processo em segundo plano.
- **Exemplo:**
  - **Menos de 1 segundo:** Feedback sutil (ex: alteração rápida de estado ou microanimação imediata de carregamento).
  - **Entre 1 e 10 segundos:** Progress indicators dinâmicos e contínuos de carregamento.
  - **Acima de 10 segundos:** Barra de progresso determinada, informando o percentual concluído, o tempo restante em segundos e fornecendo um botão explícito de cancelamento.
- **Erro a evitar:** Processar uploads pesados por minutos sem exibir nenhum indicador, travando a interface e deixando o usuário incerto sobre o progresso.

### 6.3 Mensagens de Erro, Empty e Success States

- **Diretriz de Pesquisa:** Pesquise na internet por "Designing empty states and error messages in user interfaces" para obter as especificações completas dos padrões oficiais.
- **Regra:** Garanta que cada estado de fluxo interativo apresente uma visualização clara baseada na lógica de design do sistema.
- **Exemplo:**
  - **Empty State:** Se uma pesquisa não retornar resultados, exiba um ícone e um texto neutro que guie o usuário: "Nenhum restaurante encontrado. Tente buscar por outra categoria ou termo de pesquisa".
  - **Success State:** Mensagem de confirmação imediata e fechamento do diálogo ao concluir ações importantes (ex: "Seu pedido foi confirmado!").
- **Erro a evitar:** Exibir uma lista ou tela em branco sem explicações visuais quando não houver registros, induzindo o usuário a deduzir que o sistema travou ou quebrou.

---

## 7. Responsividade e Mobile-First

### 7.1 Ergonomia do Polegar (Thumb Zone)

- **Diretriz de Pesquisa:** Pesquise na internet por "Steven Hoober mobile phone ergonomics and the Thumb Zone mapping" para obter as especificações completas dos padrões oficiais.
- **Regra:** Em visualizações móveis, posicione os controles mais acessados e de conversão principal na base e no centro da tela ("área do polegar"), deixando cantos superiores para navegação secundária e menus contextuais.
- **Exemplo:** Fixar o botão "Adicionar ao Carrinho" e as abas principais de navegação na base inferior do dispositivo móvel.
- **Erro a evitar:** Posicionar ações rotineiras e repetitivas (como botões de confirmação de compra) no topo esquerdo do cabeçalho de telas móveis, forçando o uso de duas mãos.

### 7.2 Transições de Gestos e Triggers Visuais

- **Diretriz de Pesquisa:** Pesquise na internet por "Tog askTog gesture shortcuts, swipe alternatives, and visual affordance in mobile UI" para obter as especificações completas dos padrões oficiais.
- **Regra:** Se a sua interface suporta comandos por meio de gestos de toque (como arrastos de tela - swipe), sempre forneça uma alternativa por meio de botões fixos visíveis.
- **Exemplo:** Oferecer o gesto de deslizar para excluir uma mensagem de e-mail, mas também incluir um botão em formato de lixeira à vista no menu do cartão.
- **Erro a evitar:** Ocultar todas as possibilidades de ações cruciais de um elemento atrás de um gesto oculto de arrasto sem fornecer nenhuma pista visual inicial.

---

## 8. Acessibilidade Inclusiva

### 8.1 Diretrizes do Guia GAIA para Autismo

- **Diretriz de Pesquisa:** Pesquise na internet por "Guia GAIA Acessibilidade de Interfaces Web para Autismo - Diretrizes" para obter as especificações completas dos padrões oficiais.
- **Regra:** Reduza a fadiga mental e a sobrecarga de pessoas com Transtorno do Espectro Autista (TEA) por meio de um design previsível, minimalista e redundante.
- **Exemplo:**
  - **Vocabulário simples e literal:** Evite uso de expressões não-literais, metáforas linguísticas ou ironias complexas no conteúdo do sistema.
  - **Representação Redundante:** Garanta que todas as ações e botões principais tenham sempre texto acompanhado de um ícone claro explicativo (ex: botão contendo o ícone `+` e o texto "Brincar" ou "Eu quero").
  - **Previsibilidade e customização:** Evite redirecionamentos bruscos na navegação e forneça áreas de toque ampliadas para prevenir cliques acidentais.
- **Erro a evitar:** Utilizar excesso de cores chamativas em movimento, textos exclusivamente informados por ícones vagos e layout sem espaçamentos de respiro.

### 8.2 Acessibilidade por Teclado e Sem Barreiras (WCAG)

- **Diretriz de Pesquisa:** Pesquise na internet por "W3C WCAG 2.1 Keyboard accessible success criterion 2.1.1 and keyboard traps" para obter as especificações completas dos padrões oficiais.
- **Regra:** Garanta que todas as interações e elementos clicáveis possam ser focados e acionados usando apenas a navegação por teclado. impeça a ocorrência de "Keyboard Traps" (situações onde o teclado foca em um componente mas não consegue sair dele).
- **Exemplo:** O usuário utiliza a tecla `Tab` para percorrer os links da página de forma linear e lógica e aciona-os utilizando `Enter` ou `Space`.
- **Erro a evitar:** Criar overlays de janelas ou menus interativos customizados via scripts que só respondem a eventos do mouse e bloqueiam o foco do teclado de leitores de tela.

---

## 9. Processo de Decisão para o Agente de IA

Para arquitetar, codificar ou auditar uma interface front-end de forma profissional, você deve executar este fluxo cognitivo de decisão e implementação passo a passo:

```
[Objetivo]
   └── O que o sistema deve solucionar? (Meta de design clara)
[Usuário]
   └── Quem é a persona de destino? Quais suas habilidades e expectativas?
[Conteúdo]
   └── Redija textos literais, objetivos e livre de jargões técnicos
[Layout]
   └── Projete grids consistentes, center-equalization e margens de respiro (20px)
[Hierarquia]
   └── Organize a tela seguindo o padrão de escaneamento visual (topo-esquerda)
[Componentes]
   └── Use widgets adequados à intenção de uso do usuário (ex: checkboxes para múltiplo)
[Estados]
   └── Mapeie todos os estados interativos dos widgets (Hover, Focus, Disabled)
[Responsividade]
   └── Otimize para a Thumb Zone em telas móveis e forneça suporte a gestos
[Acessibilidade]
   └── Verifique o contraste (mínimo 4.5:1), suporte a teclado e redundância visual
[Usabilidade]
   └── Aplique heurísticas preventivas e verifique a eficiência
[Implementação]
   └── Traduza as decisões em código limpo, sem scripts intrusivos
[Auditoria]
   └── Realize inspeção heurística e verifique com testes empíricos
```

---

## 10. Checklist de Revisão de IHM/UX/UI

Aplique este checklist técnico em cada entrega de código front-end antes de considerá-lo apto para publicação:

### 10.1 Layout e Hierarquia

- A tela possui simetria visual e equilíbrio centralizado (center-equalization)?
- Todas as margens internas principais possuem espaçamentos consistentes de 20 pixels?
- O layout direciona os olhos do usuário seguindo o padrão F-shape (esquerda-direita, topo-base)?
- Elementos e grupos de dados relacionados estão agrupados por proximidade ou delimitados visualmente?

### 10.2 Tipografia e Cores

- O tamanho da fonte e a tipografia mantêm consistência dentro de cada janela e painel?
- A taxa de contraste do texto sobre o fundo é de pelo menos 4.5:1 (ou 7:1 para AAA)?
- Foram evitadas cores puras e saturadas (puras e primárias) em fundos extensos?
- Todas as informações transmitidas por cores possuem um significante alternativo de reforço (ícone ou texto)?

### 10.3 Botões, Formulários e Navegação

- Os botões possuem pesos visuais consistentes divididos claramente em Primários e Secundários?
- Botões destrutivos (como "Excluir") estão fisicamente separados de botões seguros (mínimo de 12px)?
- Os formulários possuem layout empilhado verticalmente com rótulos alinhados à direita e campos à esquerda?
- A navegação principal possui no máximo 7 itens e mantém a consistência de identificação em todas as telas?

### 10.4 Acessibilidade, Feedback e Erros

- Toda a interface é plenamente navegável via teclado (`Tab` e `Enter`) sem risco de armadilhas ("Keyboard Traps")?
- Existem indicadores de progresso dinâmicos adequados à duração estimada da tarefa em background?
- As mensagens de erro evitam códigos internos, explicando de forma construtiva o problema e como solucioná-lo?
- As telas de estado vazio (Empty States) dão instruções explícitas de como o usuário pode prosseguir?
