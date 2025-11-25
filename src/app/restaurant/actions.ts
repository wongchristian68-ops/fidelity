"use server";

import { suggestReward } from "@/ai/flows/reward-suggestion-for-restaurant";
import { generateReviewResponse, type GenerateReviewResponseInput, type GenerateReviewResponseOutput } from "@/ai/flows/ai-review-response";


export async function aiSuggestReward(restaurantName: string): Promise<string> {
  const result = await suggestReward({ restaurantName });
  return result.rewardSuggestion;
}

export async function aiGenerateReviewResponse(input: GenerateReviewResponseInput): Promise<GenerateReviewResponseOutput> {
  return generateReviewResponse(input);
}
