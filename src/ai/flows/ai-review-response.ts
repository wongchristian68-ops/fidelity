'use server';

/**
 * @fileOverview AI-powered review response generator.
 *
 * - generateReviewResponse - A function that generates a response to a customer review.
 * - GenerateReviewResponseInput - The input type for the function.
 * - GenerateReviewResponseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const GenerateReviewResponseInputSchema = z.object({
  restaurantName: z.string().describe('The name of the restaurant.'),
  reviewText: z.string().describe('The text content of the customer\'s review.'),
  reviewRating: z.number().min(1).max(5).describe('The star rating given by the customer (1-5).'),
  reviewLanguage: z.string().describe('The language of the review (e.g., "English", "French", "Mandarin Chinese").'),
});
export type GenerateReviewResponseInput = z.infer<typeof GenerateReviewResponseInputSchema>;

const GenerateReviewResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the review.'),
});
export type GenerateReviewResponseOutput = z.infer<typeof GenerateReviewResponseOutputSchema>;

export async function generateReviewResponse(input: GenerateReviewResponseInput): Promise<GenerateReviewResponseOutput> {
  return aiReviewResponseFlow(input);
}

const reviewResponsePrompt = ai.definePrompt({
  name: 'reviewResponsePrompt',
  input: {schema: GenerateReviewResponseInputSchema},
  output: {schema: GenerateReviewResponseOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert Community Manager for the restaurant "{{restaurantName}}". Your task is to write a professional, polite, and helpful response to a customer review.

IMPORTANT: You MUST respond in the same language as the original review, which is {{reviewLanguage}}.

Review Details:
- Rating: {{reviewRating}} out of 5 stars
- Review Text: "{{reviewText}}"

Instructions:
1.  Acknowledge the customer's feedback, whether it is positive, negative, or mixed.
2.  If the rating is positive (4-5 stars), thank the customer warmly.
3.  If the rating is negative (1-3 stars), be empathetic, apologize for their poor experience, and offer to make things right. Avoid being defensive.
4.  Keep the response concise and professional.
5.  Address any specific points mentioned in the review if possible.
6.  Sign off as "L'équipe de {{restaurantName}}".
`,
});

const aiReviewResponseFlow = ai.defineFlow(
  {
    name: 'aiReviewResponseFlow',
    inputSchema: GenerateReviewResponseInputSchema,
    outputSchema: GenerateReviewResponseOutputSchema,
  },
  async input => {
    const {output} = await reviewResponsePrompt(input);
    return output!;
  }
);
