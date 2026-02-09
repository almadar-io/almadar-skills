/**
 * Eval runner - orchestrates schema generation, validation, and semantic checking
 */

import { LLMClient, getSharedLLMClient, parseJsonResponse } from '@almadar/llm';
import { generateKflowOrbitalsSkill } from '../src/generators/kflow-orbitals.js';
import { runSemanticCheck } from './semantic.js';
import type {
  EvalCase,
  EvalResult,
  EvalReport,
  RunOptions,
  CategoryStats,
} from './types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { globSync } from 'glob';

const execAsync = promisify(exec);

/**
 * Run a single eval case
 */
async function runEval(
  evalCase: EvalCase,
  client: LLMClient,
  options: RunOptions
): Promise<EvalResult> {
  const start = Date.now();

  // 1. Generate schema with LLM
  const skill = generateKflowOrbitalsSkill();
  const response = await client.callRawWithMetadata({
    systemPrompt: skill.content,
    userPrompt: evalCase.prompt,
    maxTokens: 16384,
  });

  const usage = response.usage ?? {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  };

  // 2. Parse JSON
  const parsed = parseJsonResponse(response.data);
  if (!parsed) {
    return {
      caseId: evalCase.id,
      pass: false,
      score: 0,
      cliValidation: {
        pass: false,
        output: '',
        errors: ['Failed to parse JSON from LLM response'],
      },
      semanticValidation: {
        pass: false,
        score: 0,
        expectations: [],
        overallReasoning: 'Schema generation failed - invalid JSON',
      },
      rawOutput: response.data,
      usage,
      latencyMs: Date.now() - start,
    };
  }

  // 3. Write to temp file and validate with CLI
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eval-'));
  const schemaPath = path.join(tmpDir, `${evalCase.id}.orb.json`);

  try {
    await fs.writeFile(schemaPath, JSON.stringify(parsed, null, 2));

    let cliValidation;
    try {
      const { stdout, stderr } = await execAsync(
        `npx @almadar/cli validate "${schemaPath}"`,
        { encoding: 'utf-8' }
      );
      cliValidation = {
        pass: true,
        output: stdout + stderr,
        errors: [],
      };
    } catch (error: any) {
      cliValidation = {
        pass: false,
        output: error.stdout || error.stderr || '',
        errors: [error.message],
      };
    }

    // 4. If CLI validation fails, return early
    if (!cliValidation.pass) {
      return {
        caseId: evalCase.id,
        pass: false,
        score: 0,
        cliValidation,
        semanticValidation: {
          pass: false,
          score: 0,
          expectations: [],
          overallReasoning: 'CLI validation failed - skipped semantic check',
        },
        rawOutput: response.data,
        usage,
        latencyMs: Date.now() - start,
      };
    }

    // 5. Run semantic check
    const semanticValidation = await runSemanticCheck(
      evalCase.prompt,
      parsed,
      evalCase.semanticExpectations,
      client
    );

    const pass = cliValidation.pass && semanticValidation.pass;
    const score = semanticValidation.score;

    return {
      caseId: evalCase.id,
      pass,
      score,
      cliValidation,
      semanticValidation,
      rawOutput: response.data,
      usage,
      latencyMs: Date.now() - start,
    };
  } finally {
    // Cleanup temp directory
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

/**
 * Load eval cases from the cases directory
 */
async function loadEvalCases(
  casesDir: string,
  options: RunOptions
): Promise<EvalCase[]> {
  const pattern = options.filter || '**/*.json';
  const files = globSync(pattern, { cwd: casesDir, absolute: true });

  const cases: EvalCase[] = [];
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const evalCase: EvalCase = JSON.parse(content);

    // Filter by tags if specified
    if (options.tags && options.tags.length > 0) {
      const caseTags = evalCase.tags || [];
      const hasMatchingTag = options.tags.some((tag) => caseTags.includes(tag));
      if (!hasMatchingTag) continue;
    }

    cases.push(evalCase);
  }

  return cases;
}

/**
 * Run all evals
 */
export async function runEvals(options: RunOptions = {}): Promise<EvalReport> {
  const start = Date.now();

  // Get LLM client
  const client = getSharedLLMClient();

  // Load eval cases
  const casesDir = path.join(process.cwd(), 'evals/cases');
  const cases = await loadEvalCases(casesDir, options);

  if (cases.length === 0) {
    throw new Error('No eval cases found');
  }

  console.log(`Running ${cases.length} eval cases...`);

  // Run evals with concurrency limit
  const concurrency = options.concurrency || 3;
  const results: EvalResult[] = [];

  for (let i = 0; i < cases.length; i += concurrency) {
    const batch = cases.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((evalCase) => runEval(evalCase, client, options))
    );
    results.push(...batchResults);

    // Log progress
    console.log(
      `Progress: ${results.length}/${cases.length} (${Math.round(
        (results.length / cases.length) * 100
      )}%)`
    );
  }

  // Aggregate results
  const passCount = results.filter((r) => r.pass).length;
  const passRate = passCount / results.length;
  const averageScore =
    results.reduce((sum, r) => sum + r.score, 0) / results.length;

  // Calculate per-category stats
  const categories: Record<string, CategoryStats> = {};
  for (const result of results) {
    const evalCase = cases.find((c) => c.id === result.caseId);
    if (!evalCase) continue;

    const tags = evalCase.tags || ['untagged'];
    for (const tag of tags) {
      if (!categories[tag]) {
        categories[tag] = { passRate: 0, avgScore: 0, count: 0 };
      }
      categories[tag].count++;
      if (result.pass) {
        categories[tag].passRate =
          (categories[tag].passRate * (categories[tag].count - 1) + 1) /
          categories[tag].count;
      } else {
        categories[tag].passRate =
          (categories[tag].passRate * (categories[tag].count - 1)) /
          categories[tag].count;
      }
      categories[tag].avgScore =
        (categories[tag].avgScore * (categories[tag].count - 1) +
          result.score) /
        categories[tag].count;
    }
  }

  // Estimate cost (rough approximation)
  const totalTokens = results.reduce((sum, r) => sum + r.usage.totalTokens, 0);
  const estimatedCost = ((totalTokens / 1000) * 0.01).toFixed(2);

  return {
    timestamp: new Date().toISOString(),
    model: options.model || 'default',
    skillVersion: '1.0.0',
    passRate,
    averageScore,
    categories,
    results,
    totalCost: `$${estimatedCost}`,
  };
}
