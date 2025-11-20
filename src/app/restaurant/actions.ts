"use server";

import { suggestReward } from "@/ai/flows/reward-suggestion-for-restaurant";

export async function aiSuggestReward(restaurantName: string): Promise<string> {
  const result = await suggestReward({ restaurantName });
  return result.rewardSuggestion;
}
