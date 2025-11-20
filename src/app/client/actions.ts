"use server";

import { aiDraftReview as draftReviewFlow } from "@/ai/flows/ai-draft-review";

export async function aiDraftReview(restaurantName: string): Promise<string> {
  const result = await draftReviewFlow({ restaurantName });
  return result.review;
}
