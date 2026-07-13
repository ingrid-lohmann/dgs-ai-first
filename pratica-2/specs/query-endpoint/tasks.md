# Tasks — Query Endpoint

| ID | Descrição | Critérios de Aceite (AC) | Dependências | Estimativa |
|---|---|---|---|---|
| **TASK-01** | Setup do Endpoint HTTP e Validação de Input | - Criar Azure Function v4 HTTP Trigger (`POST /api/query`).<br>- Validar payload de entrada usando Zod (espera `{ question: string }`).<br>- Retornar erro 400 se o payload for inválido, formatado via Pino logger. | Nenhuma | P |
| **TASK-02** | Integração com Azure OpenAI (Embeddings) | - Receber a string validada da TASK-01.<br>- Chamar o Azure OpenAI para gerar o embedding da pergunta.<br>- Implementar retry com exponential backoff para a chamada. | TASK-01 | M |
| **TASK-03** | Busca no Azure AI Search | - Usar o vetor gerado na TASK-02 para buscar os top-5 chunks no Azure AI Search.<br>- Retornar os metadados (source) junto com o texto do chunk. | TASK-02 | M |
| **TASK-04** | Montagem de Prompt e Chamada LLM | - Montar o prompt respeitando o limite (4K system + 8K chunks).<br>- Enviar prompt ao GPT-4o.<br>- Retornar JSON com a resposta e o campo `source_document`. | TASK-03 | G |