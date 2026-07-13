# Análise de Viabilidade Técnica — Projeto NovaTech (v1)

## 1. Estratégia por Tipo de Fonte

### 1.1 PDFs com tabelas complexas de frete

**Desafio para o RAG**
- Tabelas com muitas colunas (15+) tendem a perder estrutura quando extraídas como texto corrido.
- Perguntas de atendimento normalmente exigem cruzamento de múltiplas colunas (ex.: região, faixa de peso, versão da regra e exceções), e uma extração ruim gera respostas inconsistentes.

**Impacto na qualidade da resposta**
- Alto risco de erro numérico e de interpretação de regra.
- Alto risco de mistura de versões (como PROC-042 v1 vs v2) se metadados de vigência não forem preservados.

**Estratégia técnica recomendada**
- Ingestão híbrida: parser de PDF com extração de tabela estruturada (linhas/colunas) + fallback OCR para células não legíveis.
- Normalizar tabelas para formato canônico (JSON tabular/CSV lógico) com metadados por linha: `documento`, `versao`, `data_vigencia`, `pagina`, `secao`.
- Gerar chunks orientados a registros (não apenas por parágrafo), mantendo a semântica tabular.
- No retrieval, combinar busca semântica + filtro por metadados (ex.: preferir versão vigente mais recente).

---

### 1.2 PDFs escaneados (OCR obrigatório)

**Desafio para o RAG**
- OCR pode introduzir ruído (caracteres trocados, palavras truncadas, números incorretos).
- Estruturas visuais (carimbos, anexos, rodapés) podem virar texto irrelevante e poluir embeddings.

**Impacto na qualidade da resposta**
- Queda de precisão no retrieval (o chunk correto pode não ser recuperado).
- Aumento do risco de alucinação por contexto parcial/degradado.

**Estratégia técnica recomendada**
- Pipeline OCR em duas etapas: extração textual + pós-processamento (correção de ruído e remoção de boilerplate).
- Métrica de qualidade de OCR por página (score mínimo para indexação automática).
- Se score baixo, enviar para fila de revisão humana antes de indexar.
- Manter rastreabilidade da origem (imagem/página) para auditoria e troubleshooting.

---

### 1.3 Wiki Confluence com links internos e macros

**Desafio para o RAG**
- Conteúdo fragmentado entre páginas com dependências semânticas via links.
- Macros podem esconder trechos críticos (tabelas dinâmicas, expanders, include de outras páginas).

**Impacto na qualidade da resposta**
- Respostas incompletas se apenas a página principal for indexada sem resolução de links/macros.
- Possível perda de contexto normativo (ex.: regra em uma página, exceção em outra).

**Estratégia técnica recomendada**
- Exportação da wiki com resolução de macros para conteúdo final renderizado.
- Preservar grafo de links internos como metadado (`page_id`, `linked_page_ids`, `espaco`, `data_update`).
- Estratégia de retrieval em dois estágios:
	1. busca inicial por similaridade;
	2. expansão por vizinhança de links para recuperar páginas correlatas.

---

### 1.4 Planilhas Excel com fórmulas interdependentes

**Desafio para o RAG**
- Fórmulas carregam lógica de negócio implícita que não aparece no texto natural.
- Dependência entre abas/células dificulta explicar o racional de cálculo ao atendente.

**Impacto na qualidade da resposta**
- Assistente pode citar valor sem explicar regra, ou explicar regra sem refletir cálculo real.
- Alto risco de inconsistência em perguntas de simulação de frete e descontos.

**Estratégia técnica recomendada**
- Extrair conteúdo em dois níveis:
	1. nível semântico (rótulos, cabeçalhos, notas e políticas);
	2. nível computacional (fórmulas, dependências entre células e faixas).
- Construir representação de regras (ex.: DSL/JSON de fórmula) para recuperação contextual.
- Para perguntas de cálculo, preferir arquitetura RAG + ferramenta de cálculo determinístico (em vez de LLM puro).

---

## 2. Estimativa de Tokens

### 2.1 Premissas de cálculo

- Regra de conversão fornecida: **0,75 palavras por token**.
- Fórmula usada: 

$$
tokens \approx \frac{palavras}{0,75}
$$

- PDFs: foi informado volume em páginas, não em palavras. Para estimativa inicial, adoto **500 palavras/página** (média típica para documentos operacionais mistos com texto e tabela).
- Planilhas: foi informado quantidade, sem média de conteúdo textual. Para estimativa inicial, adoto **2.000 palavras equivalentes por planilha** (incluindo rótulos, cabeçalhos, observações e serialização simplificada de fórmulas/dependências).

### 2.2 Cálculo por fonte

1. **PDFs**

$$
800\ documentos \times 10\ páginas = 8.000\ páginas
$$

$$
8.000\ páginas \times 500\ palavras/página = 4.000.000\ palavras
$$

$$
tokens_{PDF} \approx \frac{4.000.000}{0,75} \approx 5.333.333\ tokens
$$

2. **Wiki Confluence**

$$
400\ páginas \times 1.500\ palavras = 600.000\ palavras
$$

$$
tokens_{Wiki} \approx \frac{600.000}{0,75} = 800.000\ tokens
$$

3. **Planilhas Excel**

$$
50\ planilhas \times 2.000\ palavras\ equivalentes = 100.000\ palavras
$$

$$
tokens_{Excel} \approx \frac{100.000}{0,75} \approx 133.333\ tokens
$$

### 2.3 Estimativa total da base

$$
tokens_{Total} \approx 5.333.333 + 800.000 + 133.333 = 6.266.666\ tokens
$$

**Estimativa inicial:** aproximadamente **6,27 milhões de tokens** de conteúdo bruto indexável.

**Leitura prática:** essa ordem de grandeza torna inviável enviar “grandes fatias” da base por query; a qualidade dependerá fortemente do pipeline de retrieval, filtros de metadados e chunking orientado ao tipo de pergunta.

---

## 3. Análise do Orçamento de Contexto

### 3.1 Capacidade útil por query

- Janela total do modelo: **128.000 tokens**.
- Reservado para system prompt + instruções base: **2.000 tokens**.

$$
contexto\_util = 128.000 - 2.000 = 126.000\ tokens
$$

### 3.2 Quantos chunks de ~500 tokens cabem

$$
chunks\_{max\ te\orico} = \frac{126.000}{500} = 252\ chunks
$$

**Resposta matemática direta:** cabem até **252 chunks de 500 tokens** no limite teórico.

### 3.3 Ajuste para operação real

Na prática, também competem por contexto:
- histórico da conversa;
- instruções de estilo/segurança;
- resposta gerada pelo próprio modelo (tokens de saída).

Se reservarmos uma margem operacional de 20% para esses elementos:

$$
contexto\_retrieval\_real \approx 126.000 \times 0,8 = 100.800\ tokens
$$

$$
chunks\_{reais} \approx \frac{100.800}{500} \approx 201\ chunks
$$

### 3.4 Implicação para estratégia de busca

- Mesmo 201-252 chunks é um número alto; incluir tudo reduz foco e aumenta conflito entre evidências.
- Para atendimento operacional, tende a funcionar melhor recuperar um conjunto pequeno e preciso (ex.: top-k de 8 a 20 chunks), seguido de re-ranking por vigência/autoridade do documento.
- A estratégia ideal é “menos contexto, mais relevante”: reduzir ruído aumenta factualidade e consistência.

---

## 4. Recomendação de Chunking

### 4.1 Estratégia recomendada

Adotar **chunking híbrido por estrutura documental**, em vez de chunking fixo puro:

- **Políticas e procedimentos textuais:** chunks de **350-550 tokens** com sobreposição de 10-15%.
- **Tabelas de frete/SLA:** chunk por bloco lógico de tabela (linhas relacionadas), preservando cabeçalhos e unidade de medida.
- **Wiki Confluence:** chunk por seção semântica (título + subtítulo + parágrafos), mantendo metadados de link.
- **Excel:** chunk por regra de negócio (faixa de células + fórmula + descrição), não por célula isolada.

### 4.2 Alinhamento ao tipo de pergunta dos atendentes

Perguntas esperadas no atendimento (prazo, regra de frete, devolução, exceção de SLA) pedem:
- respostas objetivas;
- justificativa com fonte;
- comparação entre versões quando houver conflito.

Por isso, chunks devem ser pequenos o suficiente para precisão, mas grandes o suficiente para preservar contexto normativo mínimo (regra + exceção + condição de vigência).

### 4.3 Efeito “lost in the middle” e restrições de desenho

O efeito **lost in the middle** implica que, em prompts longos, o modelo tende a usar melhor o início e o fim do contexto e “esquecer” evidências no meio.

Impactos diretos:
- Não é recomendável empilhar dezenas/centenas de chunks por query, mesmo que “caibam” matematicamente.
- Evidências críticas (versão vigente, exceções e limites) devem estar nos primeiros chunks após re-ranking.
- Quando houver conflito documental, priorizar colocação explícita da regra vigente no topo do contexto e empurrar versões legadas para baixo ou excluir por filtro.

### 4.4 Decisão prática final

- **Retriever primário:** top-k inicial de 20-30 chunks.
- **Re-ranker:** reduzir para 8-12 chunks finais de maior autoridade/relevância.
- **Prompt assembly:** ordenar por prioridade factual (vigência, documento normativo, seção exata), minimizando risco de “meio esquecido”.

Essa abordagem equilibra cobertura e precisão para o cenário NovaTech, reduz risco de respostas contraditórias e melhora auditabilidade no atendimento.
