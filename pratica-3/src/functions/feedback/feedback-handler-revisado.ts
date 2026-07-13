import { CosmosClient } from '@azure/cosmos';
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { z } from 'zod';

import logger from '../../../shared/logger';

const feedbackBodySchema = z
	.object({
		queryId: z.string().trim().min(1),
		rating: z.number().int().min(1).max(5),
		comment: z.string().trim().min(1),
		attendantEmail: z.email().trim(),
	})
	.strict();

type FeedbackBody = z.infer<typeof feedbackBodySchema>;

type StoredFeedback = FeedbackBody & {
	timestamp: string;
};

const cosmosConnectionString = process.env.COSMOS_CONNECTION_STRING;

const cosmosClient = cosmosConnectionString
	? new CosmosClient(cosmosConnectionString)
	: null;

const buildValidationErrorResponse = (
	validationResult: z.ZodError<FeedbackBody>
): HttpResponseInit => ({
	status: 400,
	jsonBody: {
		error: 'Invalid feedback payload',
		issues: validationResult.issues.map((issue) => ({
			path: issue.path.join('.'),
			message: issue.message,
		})),
	},
});

const buildStoredFeedback = (body: FeedbackBody): StoredFeedback => ({
	...body,
	timestamp: new Date().toISOString(),
});

export async function feedbackHandler(
	request: HttpRequest
): Promise<HttpResponseInit> {
	let rawBody: unknown;

	try {
		rawBody = await request.json();
	} catch {
		logger.warn({ route: 'feedback' }, 'Feedback request body is not valid JSON');

		return {
			status: 400,
			jsonBody: {
				error: 'Invalid JSON body',
			},
		};
	}

	const validationResult = feedbackBodySchema.safeParse(rawBody);

	if (!validationResult.success) {
		logger.warn(
			{
				route: 'feedback',
				issues: validationResult.error.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
				})),
			},
			'Feedback payload validation failed'
		);

		return buildValidationErrorResponse(validationResult.error);
	}

	if (!cosmosClient) {
		logger.error({ route: 'feedback' }, 'Cosmos DB connection string is not configured');

		return {
			status: 500,
			jsonBody: {
				error: 'Feedback service is unavailable',
			},
		};
	}

	const feedback = buildStoredFeedback(validationResult.data);
	const database = cosmosClient.database('novatech');
	const container = database.container('feedbacks');

	await container.items.create(feedback);

	logger.info(
		{
			queryId: feedback.queryId,
			rating: feedback.rating,
			timestamp: feedback.timestamp,
		},
		'Feedback received'
	);

	return {
		status: 200,
		jsonBody: {
			status: 'OK',
		},
	};
}

app.http('feedback', {
	methods: ['POST'],
	handler: feedbackHandler,
});