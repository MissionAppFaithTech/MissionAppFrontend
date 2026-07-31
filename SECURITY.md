# Política de Segurança

## Versões suportadas

Apenas a versão mais recente na branch `main` recebe correções de segurança. Versões anteriores não são mantidas.

| Branch / Versão | Recebe correções de segurança |
| --------------- | ----------------------------- |
| `main` (última) | ✅ Sim |
| Qualquer outra branch | ❌ Não |

---

## Reportando uma vulnerabilidade

**Não abra uma issue pública no GitHub para relatar vulnerabilidades de segurança.** Issues públicas expõem o problema antes que uma correção esteja disponível, colocando usuários e o projeto em risco.

### Como reportar

Envie um email para **missionapp.faithtech@gmail.com** com:

1. **Descrição da vulnerabilidade** — o que é e onde está (arquivo, rota, componente, fluxo no browser)
2. **Passos para reproduzir** — instruções detalhadas
3. **Impacto potencial** — o que um atacante poderia fazer
4. **Sugestão de correção** (opcional)

Inclua **`[SECURITY]`** no assunto do email para triagem prioritária.

### O que esperar

- **Confirmação de recebimento:** em até 72 horas úteis
- **Avaliação inicial:** em até 7 dias (aceita / rejeitada e motivo)
- **Correção e divulgação:** para vulnerabilidades aceitas, priorizamos o fix conforme a severidade. Você será notificado quando a correção for publicada

Pedimos confidencialidade até a correção ser publicada. Agradecemos a divulgação responsável.

---

## Escopo

Esta política cobre vulnerabilidades no código-fonte deste repositório (MissionApp Frontend). Estão fora do escopo:

- Vulnerabilidades só no [MissionApp Backend](https://github.com/MissionAppFaithTech/MissionAppBackend) — reporte lá / pelo mesmo email citando o repositório
- Vulnerabilidades em dependências de terceiros (reporte ao mantenedor da lib ou via [npm security advisories](https://docs.npmjs.com/reporting-a-vulnerability-in-an-npm-package); atualizações de deps neste repo seguem o Renovate)
- Infraestrutura de terceiros (Vercel, GitHub, etc.)
- Problemas só de configuração em ambiente local de desenvolvimento

---

## Ferramentas relacionadas

- **[Renovate](https://docs.renovatebot.com/)** — atualização automática de dependências (`renovate.json`)
