"use server";

import { aiDraftReview as draftReviewFlow } from "@/ai/flows/ai-draft-review";
import { textToSpeech as textToSpeechFlow } from "@/ai/flows/text-to-speech";

export async function aiDraftReview(restaurantName: string): Promise<string> {
  const result = await draftReviewFlow({ restaurantName });
  return result.review;
}

export async function textToSpeech(text: string): Promise<string> {
  const result = await textToSpeechFlow(text);
  return result.media;
}
