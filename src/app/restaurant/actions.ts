
"use server";

import { generateReviewResponse, type GenerateReviewResponseInput, type GenerateReviewResponseOutput } from "@/ai/flows/ai-review-response";

export async function aiGenerateReviewResponse(input: GenerateReviewResponseInput): Promise<GenerateReviewResponseOutput> {
  return generateReviewResponse(input);
}
