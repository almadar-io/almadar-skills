/**
 * Semantic validation using LLM-as-judge
 */

import type { LLMClient } from '@almadar-io/llm';
import { parseJsonResponse } from '@almadar-io/llm';
import type { SemanticValidationResult } from './types.js';

interface JudgeResponse {
  overall_score: number;
  overall_reasoning: string;
  expectations: Array<{
    expectation: string;
    met: boolean;
    reasoning: string;
  }>;
}

/**
 * Run semantic validation using LLM-as-judge
 */
export async function runSemanticCheck(
  userPrompt: string,
  schema: any,
  expectations: string[],
  client: LLMClient
): Promise<SemanticValidationResult> {
  const judgePrompt = `Given this user request:
"${userPrompt}"

And this generated orbital schema:
${JSON.stringify(schema, null, 2)}

Evaluate whether the schema correctly implements the user's request.

For each expectation below, determine if it's met:
${expectations.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Return JSON only:
{
  "overall_score": N,  // 1-5 rating (5 = excellent, 4 = good, 3 = acceptable, 2 = poor, 1 = very poor)
  "overall_reasoning": "Brief explanation of overall quality",
  "expectations": [
    { "expectation": "...", "met": true/false, "reasoning": "..." }
  ]
}`;

  try {
    const response = await client.callRawWithMetadata({
      systemPrompt:
        'You are an expert at evaluating orbital schemas. Be objective and precise. Focus on whether the schema correctly implements the requirements.',
      userPrompt: judgePrompt,
      maxTokens: 4096,
    });

    const parsed = parseJsonResponse(response.raw || String(response)) as JudgeResponse | null;
    if (!parsed || typeof parsed.overall_score !== 'number') {
      return {
        pass: false,
        score: 0,
        expectations: [],
        overallReasoning: 'Failed to parse judge response',
      };
    }

    // Map 1-5 score to 0-1
    const score = parsed.overall_score / 5;

    // Pass if all expectations met AND score >= 0.6 (3/5 or better)
    const allExpectationsMet = parsed.expectations.every((e) => e.met);
    const pass = allExpectationsMet && score >= 0.6;

    return {
      pass,
      score,
      expectations: parsed.expectations,
      overallReasoning: parsed.overall_reasoning,
    };
  } catch (error: any) {
    return {
      pass: false,
      score: 0,
      expectations: [],
      overallReasoning: `Error during semantic check: ${error.message}`,
    };
  }
}
