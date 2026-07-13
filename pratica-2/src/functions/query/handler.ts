import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import pino from 'pino';
import { z } from 'zod';

const logger = pino({
	name: 'query-endpoint',
	level: process.env.LOG_LEVEL ?? 'info',
});

const queryRequestSchema = z.object({
	question: z.string().min(1),
});

export async function queryHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	logger.info(
		{
			invocationId: context.invocationId,
			method: request.method,
			url: request.url,
		},
		'Received query request',
	);

	let requestBody: unknown;

	try {
		requestBody = await request.json();
	} catch (error) {
		logger.warn(
			{
				invocationId: context.invocationId,
				error,
			},
			'Request body is not valid JSON',
		);

		return {
			status: 400,
			jsonBody: {
				error: 'Invalid request body',
			},
		};
	}

	const validationResult = queryRequestSchema.safeParse(requestBody);

	if (!validationResult.success) {
		logger.warn(
			{
				invocationId: context.invocationId,
				issues: validationResult.error.flatten(),
			},
			'Request validation failed',
		);

		return {
			status: 400,
			jsonBody: {
				error: 'Validation failed',
				details: validationResult.error.flatten(),
			},
		};
	}

	logger.info(
		{
			invocationId: context.invocationId,
			questionLength: validationResult.data.question.length,
		},
		'Request validated successfully',
	);

	return {
		status: 200,
		jsonBody: {
			message: 'Query endpoint is ready',
		},
	};
}

app.http('query', {
	methods: ['POST'],
	authLevel: 'anonymous',
	handler: queryHandler,
});
