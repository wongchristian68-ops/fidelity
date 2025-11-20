'use server';

/**
 * @fileOverview AI-powered review drafting flow.
 *
 * - aiDraftReview - A function that generates a restaurant review draft.
 * - AiDraftReviewInput - The input type for the aiDraftReview function.
 * - AiDraftReviewOutput - The return type for the aiDraftReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDraftReviewInputSchema = z.object({
  restaurantName: z.string().describe('The name of the restaurant.'),
});

export type AiDraftReviewInput = z.infer<typeof AiDraftReviewInputSchema>;

const AiDraftReviewOutputSchema = z.object({
  review: z.string().describe('The AI-generated review of the restaurant.'),
});

export type AiDraftReviewOutput = z.infer<typeof AiDraftReviewOutputSchema>;

export async function aiDraftReview(input: AiDraftReviewInput): Promise<AiDraftReviewOutput> {
  return aiDraftReviewFlow(input);
}

const aiDraftReviewPrompt = ai.definePrompt({
  name: 'aiDraftReviewPrompt',
  input: {schema: AiDraftReviewInputSchema},
  output: {schema: AiDraftReviewOutputSchema},
  prompt: `You are a helpful AI assistant that helps users draft reviews for restaurants.

  Generate a positive and concise review (around 50 words) for the restaurant "{{restaurantName}}". Focus on the great aspects of the dining experience.
  `,
});

const aiDraftReviewFlow = ai.defineFlow(
  {
    name: 'aiDraftReviewFlow',
    inputSchema: AiDraftReviewInputSchema,
    outputSchema: AiDraftReviewOutputSchema,
  },
  async input => {
    const {output} = await aiDraftReviewPrompt(input);
    return output!;
  }
);
