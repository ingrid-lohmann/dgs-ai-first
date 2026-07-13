# Análise de Viabilidade Técnica — Projeto NovaTech (Versão Final)

## Revisão Crítica da Versão Inicial

### 1. Pontos fracos na estratégia por tipo de fonte

1. **OCR de PDFs escaneados foi tratado de forma genérica**
- Fragilidade: a versão inicial considera score de OCR por página, mas não aborda erro por célula/estrutura, que é onde tabelas de frete costumam falhar mais.
- Risco real: trocar um dígito em multiplicador regional (ex.: 1,5 vs 1,8) gera resposta plausível, porém errada, com alto impacto operacional.
- Correção: usar OCR/layout-aware com validação estrutural de tabela (linhas, colunas, cabeçalhos, tipos esperados), não só texto corrido.

2. **Planilhas Excel tiveram complexidade subestimada**
- Fragilidade: a estratégia original menciona fórmulas interdependentes, mas não cobre dependências externas (links para outras planilhas), nomes definidos, fórmulas voláteis e possíveis macros.
- Risco real: o assistente explica regra sem refletir o cálculo efetivo utilizado pelo Comercial.
- Correção: extrair grafo de dependências, classificar fórmulas por criticidade e isolar planilhas não determinísticas para validação manual.

3. **Confluence com links/macros sem tratamento de governança de acesso**
- Fragilidade: a extração de macros foi citada, mas não foi discutido controle de permissões por espaço/página.
- Risco real: vazamento de conteúdo interno para atendentes sem acesso ou respostas baseadas em conteúdo que o usuário final não deveria ver.
- Correção: indexação com ACL herdada da origem e enforcement em query time.

4. **Contradição documental foi tratada, mas sem política decisória formal**
- Fragilidade: priorizar versão mais recente não basta quando há regra transitória, contrato legado ou exceção operacional.
- Risco real: resposta “correta em geral” e errada para o caso do cliente.
- Correção: política de precedência explícita: `vigencia + tipo de cliente + data do chamado + autoridade documental`.

---

### 2. Otimismo nas estimativas de tokens/processamento

1. **Estimativa pontual única (6,27M) é otimista para base heterogênea**
- Fragilidade: assumir 500 palavras/página para todos os PDFs ignora páginas com tabela densa, duplicação de cabeçalho e ruído de OCR.
- Risco real: subdimensionar custo de ingestão, embedding e reindexação.

2. **Excel em 2.000 palavras equivalentes por planilha pode estar baixo**
- Fragilidade: serialização de fórmulas, relações entre abas e metadados técnicos aumenta tokens rapidamente.
- Risco real: orçamento de processamento inicial e mensal abaixo do necessário.

3. **Faltou separar “tokens da base” de “tokens efetivamente úteis ao retrieval”**
- Fragilidade: conteúdo bruto não é sinônimo de contexto útil; duplicidades e versões concorrentes inflacionam índice e pioram busca.
- Correção: deduplicação semântica, versionamento ativo/arquivado e compressão de contexto por sumarização estruturada.

---

### 3. Riscos arquiteturais de contexto pouco explorados

1. **Latência e custo com janelas longas (128K)**
- Fragilidade: cálculo de capacidade foi correto, mas não foi enfatizado que usar contexto muito grande degrada SLA de atendimento.
- Risco real: resposta lenta (pior experiência para operação de suporte) e custo por query elevado.

2. **Context contamination por histórico de conversa**
- Fragilidade: não foi detalhado como impedir que instruções antigas da conversa afetem respostas novas.
- Risco real: o modelo reutiliza premissas de um chamado em outro.

3. **Conflito entre chunks similares (near-duplicates)**
- Fragilidade: não havia estratégia explícita para chunks quase idênticos de versões diferentes.
- Risco real: o re-ranker traz evidências conflitantes e o LLM mistura regras.

4. **Answerability/abstenção insuficientemente formalizada**
- Fragilidade: recomendou foco em relevância, mas não definiu gatilho quantitativo para responder “não encontrei base suficiente”.
- Risco real: alucinação com linguagem confiante.

5. **Lost in the middle tratado, mas sem mecanismo operacional de mitigação**
- Fragilidade: faltou prescrever montagem de prompt por blocos prioritários e limite estrito de evidências por query.
- Risco real: informação crítica enterrada no meio do contexto.

---

## 1. Estratégia por Tipo de Fonte (Aprimorada)

### 1.1 PDFs com tabelas complexas

**Desafio técnico**
- Tabelas de frete e SLA têm semântica matricial; extração linear destrói relação linha-coluna.

**Estratégia recomendada**
- Extração em duas trilhas: 
	1. parser estrutural (tabela nativa quando disponível);
	2. OCR layout-aware para tabela em imagem.
- Validação automática de qualidade tabular:
	- consistência de cabeçalhos;
	- cardinalidade esperada de colunas;
	- checagem de tipo (numérico, percentual, texto).
- Chunks por bloco de regra tabular (não por página inteira), mantendo metadados: `doc_id`, `versao`, `vigencia_inicio`, `vigencia_fim`, `secao`, `pagina`, `confianca_extracao`.

**Mitigação de risco crítico**
- Se confiança estrutural < limiar (ex.: 0,92), chunk não vai para índice produtivo e segue para revisão humana.

---

### 1.2 PDFs escaneados

**Desafio técnico**
- Ruído de OCR e perda de layout reduzem precisão semântica e podem corromper valores.

**Estratégia recomendada**
- Pré-processamento de imagem (deskew, denoise, contraste).
- OCR com saída de bounding boxes e confiança por bloco.
- Pós-processamento com dicionário de domínio (ANTT, CT-e, SLA, regiões, unidades).
- Índice com rastreabilidade: cada evidência aponta para página e coordenadas da origem.

**Mitigação de risco crítico**
- Política de quarentena de documentos com baixa legibilidade; resposta não deve citar conteúdo de baixa confiança sem alerta.

---

### 1.3 Wiki Confluence com links e macros

**Desafio técnico**
- Conteúdo final depende de macro/renderização e do contexto de páginas relacionadas.

**Estratégia recomendada**
- Ingestão do HTML renderizado final (não só storage bruto).
- Expansão de links em profundidade controlada (1 salto por padrão).
- Indexação com ACL da origem (espaço/página).
- Metadados de governança: `space`, `owner`, `ultima_atualizacao`, `criticidade`.

**Mitigação de risco crítico**
- Enforcement de autorização em query time para evitar vazamento de conteúdo.

---

### 1.4 Planilhas Excel com fórmulas interdependentes

**Desafio técnico**
- Lógica de negócio está nas fórmulas, não apenas em texto/cabeçalhos.

**Estratégia recomendada**
- Extrair três camadas:
	1. semântica (rótulos e descrições);
	2. cálculo (fórmulas normalizadas);
	3. dependência (grafo entre células/abas/arquivos).
- Classificar planilhas por determinismo:
	- determinística: apta para motor de cálculo;
	- não determinística/externa: apta só para consulta assistida com aviso.
- Para perguntas numéricas, usar **RAG + engine determinístico de cálculo**; LLM apenas explica o racional.

**Mitigação de risco crítico**
- Proibir resposta numérica final quando cadeia de dependências estiver incompleta.

---

## 2. Estimativa de Tokens (Revisada com Faixas)

### 2.1 Premissas

- Conversão fornecida: **0,75 palavras/token**.
- Fórmula:

$$
tokens \approx \frac{palavras}{0,75}
$$

- PDFs: faixa de 450 a 700 palavras/página (baixa e alta densidade, incluindo efeito de OCR).
- Wiki: 1.500 palavras/página (dado fornecido), com fator de expansão de 1,10 para macros/renderização.
- Excel: 2.000 a 5.000 palavras equivalentes por planilha (dependendo da complexidade de fórmulas/dependências).

### 2.2 Cálculo por fonte

1. **PDFs**

$$
8.000\ páginas \times (450\ a\ 700) = 3.600.000\ a\ 5.600.000\ palavras
$$

$$
tokens_{PDF} \approx 4.800.000\ a\ 7.466.667
$$

2. **Wiki Confluence**

$$
400 \times 1.500 = 600.000\ palavras
$$

$$
600.000 \times 1,10 = 660.000\ palavras\ efetivas
$$

$$
tokens_{Wiki} \approx \frac{660.000}{0,75} = 880.000
$$

3. **Excel**

$$
50 \times (2.000\ a\ 5.000) = 100.000\ a\ 250.000\ palavras
$$

$$
tokens_{Excel} \approx 133.333\ a\ 333.333
$$

### 2.3 Faixa total estimada

$$
tokens_{Total} \approx (4.800.000 + 880.000 + 133.333)\ a\ (7.466.667 + 880.000 + 333.333)
$$

$$
tokens_{Total} \approx 5.813.333\ a\ 8.680.000
$$

**Conclusão:** base bruta provável entre **5,8M e 8,7M tokens**.

### 2.4 Implicação arquitetural

- Planejamento de custo e throughput deve usar cenário base e cenário pessimista, não estimativa pontual única.
- Recomenda-se orçamento de capacidade com folga de 30-40% para reprocessamentos, versão nova de documentos e correções de OCR.

---

## 3. Análise do Orçamento de Contexto

### 3.1 Limite matemático

- Janela: 128.000 tokens.
- Reservado (system + instruções): 2.000.

$$
contexto\_util = 126.000
$$

- Chunks de 500 tokens:

$$
chunks_{teoricos} = \frac{126.000}{500} = 252
$$

### 3.2 Limite operacional real

Reservas realistas:
- histórico da conversa;
- instruções de segurança;
- resposta do modelo;
- evidências de citação.

Assumindo orçamento útil de retrieval entre 25.000 e 45.000 tokens:

$$
chunks_{operacionais} \approx \frac{25.000\ a\ 45.000}{500} = 50\ a\ 90
$$

**Observação:** mesmo 50-90 é alto para qualidade em domínio contraditório; a estratégia recomendada é enviar bem menos evidências, com re-ranking agressivo.

### 3.3 Impacto na busca e resposta

- 128K não deve ser meta de uso; deve ser teto de segurança.
- Mais contexto tende a aumentar latência e custo e pode piorar precisão por competição atencional.
- Objetivo de produção: contexto curto, altamente relevante e ordenado por precedência normativa.

### 3.4 Riscos de contexto e mitigação

1. **Lost in the middle**
- Mitigação: assembly em blocos priorizados (regra vigente, exceções, evidências secundárias) e limite estrito de chunks finais.

2. **Context contamination (histórico conversacional)**
- Mitigação: reset de estado por ticket/chamado e janela curta de memória de conversa.

3. **Conflito entre versões semelhantes**
- Mitigação: deduplicação semântica + política de precedência com metadata filters.

4. **Alucinação por baixa cobertura**
- Mitigação: classificador de answerability com fallback obrigatório: “não encontrei base suficiente”.

5. **Latência operacional**
- Mitigação: pipeline de retrieval em dois estágios (candidate recall + rerank) com cache por intenção de pergunta.

---

## 4. Recomendação de Chunking (Final)

### 4.1 Estratégia de chunking por tipo de conteúdo

- **Normas e procedimentos textuais:** 300-450 tokens, overlap 12%.
- **Tabelas (frete/SLA):** chunk lógico por faixa de regra (linha + cabeçalho + notas), 150-300 tokens efetivos por unidade.
- **Confluence:** chunk por seção semântica + contexto de título pai.
- **Excel:** chunk por regra calculável (entradas, fórmula normalizada, saída esperada, escopo).

### 4.2 Estratégia de retrieval e montagem de prompt

1. Recuperação inicial: top-k 30-40 candidatos (alta revocação).
2. Re-ranking híbrido (semântica + autoridade + vigência + tipo documental).
3. Contexto final: 8-14 chunks prioritários.
4. Ordenação do prompt:
	 - bloco A: regra vigente e fonte primária;
	 - bloco B: exceções e transição de versão;
	 - bloco C: evidências complementares.

### 4.3 Restrições explícitas por causa do lost in the middle

- Não enviar contexto “enciclopédico” para perguntas pontuais.
- Não misturar versões legadas e vigentes sem marcador explícito de precedência.
- Sempre posicionar no início do contexto as evidências normativas críticas para a resposta.

### 4.4 Política de resposta para atendimento

- Se evidência insuficiente ou conflitante, o assistente deve:
	1. declarar incerteza de forma explícita;
	2. citar o conflito documental detectado;
	3. orientar encaminhamento (ex.: Compliance/Operações).

### 4.5 Decisão arquitetural consolidada

- **RAG de precisão** (poucos chunks, alta autoridade) para perguntas operacionais.
- **RAG + cálculo determinístico** para perguntas numéricas de frete.
- **Governança documental obrigatória** (vigência, precedência, ACL, trilha de auditoria) para evitar respostas plausíveis e incorretas.

Essa configuração reduz risco de erro silencioso, melhora previsibilidade de qualidade e mantém SLA de atendimento compatível com uso em operação.
