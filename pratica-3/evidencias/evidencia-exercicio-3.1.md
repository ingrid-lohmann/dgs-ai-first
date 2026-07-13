# Evidência - Exercício 3.1 (Harness Engineering: Structured Output)

## 1. Schema Zod (Structured Output)
O schema garante que a IA não responda em texto livre, forçando a presença obrigatória da resposta, do documento fonte e do score de confiança.

```typescript
export const structuredOutputSchema = z.object({
  answer: z.string().trim().min(1),
  source_document: z.string().trim().min(1),
  confidence_score: z.enum(['Alta', 'Baixa']),
}).strict();
```

## 2. Código do Validador (response-validator.ts)
pratica-3/src/services/response-validator.ts

## 3. Revisão Crítica (Code Review)
Durante a revisão do código gerado pelo Copilot, identificamos e corrigimos os seguintes pontos:

1. *Vazamento de Payload (Corrigido):* O código inicial do Zod poderia aceitar propriedades não mapeadas injetadas pelo LLM. A correção aplicou o método .strict() no schema para garantir que apenas os três campos previstos sejam processados.

2. *Falha de Case Sensitivity na Regra de Negócio (Corrigido):* O regex inicial falhava se a IA respondesse "Carga Perigosa" ou "DEVOLUÇÃO". A correção implementou uma função normalizeText que remove diacríticos e padroniza para lowercase antes da validação.

3. *Violação do AGENTS.md (Logger):* O código usou console.error e console.warn. Em um projeto real, isso precisaria ser refatorado para importar a instância do pino (import logger from '../shared/logger') para manter a padronização de observabilidade do projeto.