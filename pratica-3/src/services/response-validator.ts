import { z } from 'zod';

export const structuredOutputSchema = z.object({
	answer: z.string().trim().min(1),
	source_document: z.string().trim().min(1),
	confidence_score: z.enum(['Alta', 'Baixa']),
}).strict();

const defaultErrorResponse = {
	answer: 'Desculpe, nao foi possivel validar a resposta gerada.',
	source_document: 'indisponivel',
	confidence_score: 'Baixa' as const,
};

const defaultSafetyResponse = {
	answer: 'Desculpe, a resposta foi bloqueada por uma regra de seguranca.',
	source_document: 'policy://response-safety',
	confidence_score: 'Baixa' as const,
};

const normalizeText = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ')
		.toLowerCase();

const negativeTerms = ['nao', 'nunca', 'jamais', 'proibido', 'proibida', 'vedado', 'vedada'];
const dangerousCargoPattern = /\bcargas?\s+perigosas?\b/;
const returnPattern = /\bdevolu(?:cao|coes)\b/;

const hasNegativeTerm = (value: string) =>
	negativeTerms.some((negativeTerm) => new RegExp(`\\b${negativeTerm}\\b`).test(value));

export function validateResponse(payload: any) {
	const validationResult = structuredOutputSchema.safeParse(payload);

	if (!validationResult.success) {
		console.error('Invalid structured response payload', {
			issues: validationResult.error.issues.map((issue) => ({
				path: issue.path.join('.'),
				message: issue.message,
			})),
		});

		return defaultErrorResponse;
	}

	const normalizedAnswer = normalizeText(validationResult.data.answer);
	const mentionsDangerousCargo = dangerousCargoPattern.test(normalizedAnswer);
	const mentionsReturn = returnPattern.test(normalizedAnswer);
	const containsNegativeTerm = hasNegativeTerm(normalizedAnswer);

	if (mentionsDangerousCargo && mentionsReturn && !containsNegativeTerm) {
		console.warn('Blocked response by safety rule', {
			reason: 'dangerous-cargo-return-without-negative-term',
			source_document: validationResult.data.source_document,
			confidence_score: validationResult.data.confidence_score,
		});

		return defaultSafetyResponse;
	}

	return validationResult.data;
}
