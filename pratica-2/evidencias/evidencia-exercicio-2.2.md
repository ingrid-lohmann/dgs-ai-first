# Evidência - Exercício 2.2 (Spec Driven Development)

## 1. Documento de Tasks (tasks.md)
| ID | Descrição | Critérios de Aceite (AC) | Dependências | Estimativa |
|---|---|---|---|---|
| **TASK-01** | Setup do Endpoint HTTP e Validação de Input | - Criar Azure Function v4 HTTP Trigger (`POST /api/query`).<br>- Validar payload de entrada usando Zod (espera `{ question: string }`).<br>- Retornar erro 400 se o payload for inválido, formatado via Pino logger. | Nenhuma | P |
| **TASK-02** | Integração com Azure OpenAI (Embeddings) | - Receber a string validada da TASK-01.<br>- Chamar o Azure OpenAI para gerar o embedding.<br>- Implementar retry com exponential backoff. | TASK-01 | M |
| **TASK-03** | Busca no Azure AI Search | - Usar o vetor gerado para buscar top-5 chunks no Azure AI Search.<br>- Retornar metadados e texto do chunk. | TASK-02 | M |
| **TASK-04** | Montagem de Prompt e Chamada LLM | - Montar prompt respeitando o limite (4K system + 8K chunks).<br>- Enviar prompt ao GPT-4o e retornar JSON. | TASK-03 | G |

## 2. Código Implementado (Copilot) - TASK-01
*(Cole aqui todo o código do `handler.ts` que você gerou com o Copilot)*

## 3. Revisão Crítica do Código Gerado
Apesar de funcionalmente correto, o código gerado pelo Copilot exigiria os seguintes ajustes em um Code Review real para se adequar à arquitetura do projeto:

1. **Separação de Responsabilidades (Zod):** O schema `queryRequestSchema` está "hardcoded" no arquivo da função. Ele deve ser movido para `src/functions/query/validator.ts` para facilitar testes unitários da validação e manter o handler mais enxuto.
2. **Centralização do Logger:** A instância do `pino` não deve ser declarada dentro do handler. A configuração de nível e transporte de logs deve residir em `src/shared/logger.ts` e ser importada por todos os endpoints, garantindo consistência na formatação dos logs da aplicação inteira.