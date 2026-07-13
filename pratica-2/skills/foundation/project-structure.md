# SKILL.md — project-structure

## Activation

Sempre que gerar um novo endpoint ou serviço.

## Purpose

Esta skill orienta agentes de IA sobre como organizar código novo neste projeto para manter separação clara entre entrada HTTP, validação, lógica de negócio e infraestrutura compartilhada.

## Scope

Use esta skill ao criar ou alterar:

- endpoints HTTP em `src/functions/`
- serviços em `src/services/`
- validadores de entrada e saída
- arquivos compartilhados em `src/shared/`

## Prescriptive Rules

1. Todo endpoint HTTP DEVE manter o arquivo `handler.ts` focado em orquestração de requisição e resposta.
2. Validações com Zod DEVEM ficar obrigatoriamente em arquivos separados chamados `validator.ts`.
3. Validações com Zod NUNCA DEVEM ser declaradas dentro de `handler.ts`.
4. O `handler.ts` DEVE importar schemas, parsers ou helpers de validação a partir de `validator.ts`.
5. Lógica de negócio que não seja estritamente parsing HTTP ou montagem de resposta NÃO DEVE ficar no `handler.ts`; ela DEVE ser movida para `src/services/` ou outro módulo adequado.
6. O logger com `pino` NÃO DEVE ser inicializado dentro de handlers ou serviços individuais.
7. Todo handler ou serviço DEVE importar o logger compartilhado de `shared/logger.ts`.
8. Um novo endpoint DEVE seguir, sempre que aplicável, esta estrutura mínima:

```text
src/
	functions/
		<endpoint-name>/
			handler.ts
			validator.ts
	services/
		<service-name>.ts
	shared/
		logger.ts
```

## File Responsibilities

### `handler.ts`

Responsável por:

- receber a requisição
- chamar parsing do body
- invocar validação importada
- registrar eventos com logger compartilhado
- delegar lógica de negócio
- retornar `HttpResponseInit`

Não é responsável por:

- definir schema Zod inline
- inicializar `pino`
- concentrar regras de negócio

### `validator.ts`

Responsável por:

- declarar schemas Zod
- expor funções de validação e parsing
- centralizar regras de formato de entrada e saída

### `shared/logger.ts`

Responsável por:

- criar a instância compartilhada do logger
- definir nome, nível e configuração base de logging

## DON'T

Validação e roteamento misturados no mesmo handler:

```ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import pino from 'pino';
import { z } from 'zod';

const logger = pino({ name: 'query-endpoint' });

const requestSchema = z.object({
	question: z.string().min(1),
});

export async function queryHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const body = await request.json();
	const parsed = requestSchema.safeParse(body);

	if (!parsed.success) {
		logger.warn({ invocationId: context.invocationId }, 'Validation failed');

		return {
			status: 400,
			jsonBody: { error: 'Validation failed' },
		};
	}

	return {
		status: 200,
		jsonBody: { ok: true },
	};
}

app.http('query', {
	methods: ['POST'],
	authLevel: 'anonymous',
	handler: queryHandler,
});
```

Problemas do exemplo acima:

- schema Zod definido no `handler.ts`
- logger inicializado no próprio handler
- responsabilidade de roteamento misturada com validação

## DO

Validação separada, importada e logger compartilhado.

`src/functions/query/validator.ts`

```ts
import { z } from 'zod';

export const queryRequestSchema = z.object({
	question: z.string().min(1),
});

export function validateQueryRequest(input: unknown) {
	return queryRequestSchema.safeParse(input);
}
```

`src/shared/logger.ts`

```ts
import pino from 'pino';

export const logger = pino({
	name: 'novatech-assistant',
	level: process.env.LOG_LEVEL ?? 'info',
});
```

`src/functions/query/handler.ts`

```ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateQueryRequest } from './validator';
import { logger } from '../../shared/logger';

export async function queryHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const body = await request.json();
	const parsed = validateQueryRequest(body);

	if (!parsed.success) {
		logger.warn(
			{
				invocationId: context.invocationId,
				issues: parsed.error.flatten(),
			},
			'Validation failed',
		);

		return {
			status: 400,
			jsonBody: { error: 'Validation failed' },
		};
	}

	logger.info(
		{
			invocationId: context.invocationId,
			questionLength: parsed.data.question.length,
		},
		'Request validated successfully',
	);

	return {
		status: 200,
		jsonBody: { ok: true },
	};
}

app.http('query', {
	methods: ['POST'],
	authLevel: 'anonymous',
	handler: queryHandler,
});
```

## Anti-Patterns

Nunca faça isto:

- inicializar `pino` diretamente dentro de `handler.ts`
- declarar schema Zod inline dentro de `handler.ts`
- misturar parsing HTTP, validação, logging setup e regra de negócio no mesmo arquivo
- duplicar schemas semelhantes em múltiplos handlers

Sempre faça isto:

- importar o logger de `shared/logger.ts`
- criar um `validator.ts` ao lado do handler para qualquer endpoint novo
- manter `handler.ts` pequeno e orientado a fluxo
- mover lógica reutilizável para `src/services/` ou `src/shared/`

## Review Checklist

Antes de considerar o código aceitável, confirme:

- existe `validator.ts` separado para o endpoint ou serviço que valida entrada
- `handler.ts` não contém `z.object(...)`
- `handler.ts` não contém `pino(...)`
- o logger vem de `shared/logger.ts`
- o handler apenas orquestra entrada, validação, chamada de serviço e resposta

