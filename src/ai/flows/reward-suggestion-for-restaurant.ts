'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting reward options for a restaurant's loyalty program.
 *
 * The flow takes the restaurant name as input and returns a suggestion for a reward.
 * - suggestReward - A function that suggests rewards for restaurants.
 * - SuggestRewardInput - The input type for the suggestReward function.
 * - SuggestRewardOutput - The return type for the suggestReward function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRewardInputSchema = z.object({
  restaurantName: z.string().describe('The name of the restaurant.'),
});
export type SuggestRewardInput = z.infer<typeof SuggestRewardInputSchema>;

const SuggestRewardOutputSchema = z.object({
  rewardSuggestion: z.string().describe('A suggested reward for the restaurant loyalty program.'),
});
export type SuggestRewardOutput = z.infer<typeof SuggestRewardOutputSchema>;

export async function suggestReward(input: SuggestRewardInput): Promise<SuggestRewardOutput> {
  return suggestRewardFlow(input);
}

const suggestRewardPrompt = ai.definePrompt({
  name: 'suggestRewardPrompt',
  input: {schema: SuggestRewardInputSchema},
  output: {schema: SuggestRewardOutputSchema},
  prompt: `You are a marketing expert specializing in restaurant loyalty programs. Suggest a reward that would be attractive to customers of {{restaurantName}}. Be creative and enticing, but also practical for the restaurant to offer. Suggest only the reward, not any other text.`,  
});

const suggestRewardFlow = ai.defineFlow(
  {
    name: 'suggestRewardFlow',
    inputSchema: SuggestRewardInputSchema,
    outputSchema: SuggestRewardOutputSchema,
  },
  async input => {
    const {output} = await suggestRewardPrompt(input);
    return output!;
  }
);
