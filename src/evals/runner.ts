#!/usr/bin/env tsx
import 'dotenv/config';

/**
 * Composition Quality Eval Runner
 *
 * Runs evaluation cases against LLM providers using @almadar/llm
 * and generates comparison reports.
 *
 * Usage:
 *   npx tsx runner.ts --provider anthropic --model claude-3-5-sonnet-20241022
 *   npx tsx runner.ts --compare-all
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  getSharedLLMClient, 
  type LLMProvider,
  parseJsonResponse 
} from '@almadar/llm';
import {
  EVAL_CASES,
  calculateTotalScore,
  analyzeComposition,
  generateComparisonMatrix,
  type EvalCase,
  type EvalResult,
  type ProviderComparison
} from './composition-quality.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface RunOptions {
  provider?: LLMProvider;
  model?: string;
  caseName?: string;
  compareAll?: boolean;
  outputDir?: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): RunOptions {
  const args = process.argv.slice(2);
  const options: RunOptions = {
    outputDir: path.join(__dirname, 'results')
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--provider':
        options.provider = args[++i] as LLMProvider;
        break;
      case '--model':
        options.model = args[++i];
        break;
      case '--case':
        options.caseName = args[++i];
        break;
      case '--compare-all':
        options.compareAll = true;
        break;
      case '--output':
        options.outputDir = args[++i];
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Composition Quality Eval Runner

Usage:
  npx tsx runner.ts --provider <provider> --model <model> [options]

Options:
  --provider <name>    LLM provider (anthropic, openai, deepseek, kimi)
  --model <name>       Model name (e.g., claude-3-5-sonnet-20241022)
  --case <name>        Run specific test case only
  --compare-all        Run all configured providers and generate comparison
  --output <dir>       Output directory for results (default: ./results)
  --help               Show this help

Examples:
  # Run with Claude 3.5 Sonnet
  npx tsx runner.ts --provider anthropic --model claude-3-5-sonnet-20241022

  # Run specific test case with GPT-4
  npx tsx runner.ts --provider openai --model gpt-4-turbo --case task-management

  # Compare all providers
  npx tsx runner.ts --compare-all
`);
}

/**
 * Load the skill content to use as system prompt
 */
function loadSkillContent(): string {
  const skillPath = path.join(__dirname, '..', '.skills', 'kflow-orbitals', 'SKILL.md');
  return fs.readFileSync(skillPath, 'utf-8');
}

/**
 * Run a single test case against a provider
 */
async function runTestCase(
  testCase: EvalCase,
  provider: LLMProvider,
  model: string,
  skillContent: string
): Promise<EvalResult> {
  console.log(`  Running ${testCase.name}...`);

  const client = getSharedLLMClient({
    provider,
    model,
    // API key will be loaded from environment by the client
  });

  try {
    console.log('    Sending request to LLM...');
    const response = await client.call<string>({
      systemPrompt: skillContent,
      userPrompt: testCase.prompt,
      temperature: 0.7,
      maxTokens: 8000,
    });

    console.log('    Received response, parsing schema...');
    
    // Extract and parse the schema from response
    const schemaText = extractSchema(response);
    let schema: any;
    
    try {
      schema = parseJsonResponse(schemaText);
      console.log('    Schema parsed successfully');
    } catch (e) {
      console.log('    Failed to parse schema:', e);
      return {
        caseName: testCase.name,
        provider: `${provider}/${model}`,
        score: 0,
        passed: false,
        breakdown: { structure: 0, composition: 0, theme: 0, quality: 0 },
        validationErrors: [`Failed to parse schema JSON: ${e}`],
        validationWarnings: []
      };
    }

    // Run validation (would use actual CLI in production)
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    // Calculate score
    const { score, breakdown } = calculateTotalScore(schema, testCase, validationErrors);

    return {
      caseName: testCase.name,
      provider: `${provider}/${model}`,
      score,
      passed: score >= testCase.minScore,
      breakdown,
      validationErrors,
      validationWarnings
    };

  } catch (error) {
    console.error(`    Error: ${error}`);
    return {
      caseName: testCase.name,
      provider: `${provider}/${model}`,
      score: 0,
      passed: false,
      breakdown: { structure: 0, composition: 0, theme: 0, quality: 0 },
      validationErrors: [String(error)],
      validationWarnings: []
    };
  }
}

/**
 * Extract schema JSON from LLM response
 */
function extractSchema(content: string): string {
  // Try to find JSON in code blocks
  const codeBlockMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find JSON between curly braces
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return content;
}

/**
 * Run all test cases for a provider
 */
async function runProviderEval(
  provider: LLMProvider,
  model: string,
  options: RunOptions
): Promise<ProviderComparison> {
  console.log(`\n🧪 Testing ${provider}/${model}...`);

  const skillContent = loadSkillContent();
  const casesToRun = options.caseName 
    ? EVAL_CASES.filter(c => c.name === options.caseName)
    : EVAL_CASES;

  const results: { caseName: string; score: number; passed: boolean }[] = [];
  let totalScore = 0;

  for (const testCase of casesToRun) {
    const result = await runTestCase(testCase, provider, model, skillContent);
    results.push({
      caseName: result.caseName,
      score: result.score,
      passed: result.passed
    });
    totalScore += result.score;

    // Save individual result
    saveResult(result, options.outputDir!);
  }

  const avgScore = Math.round(totalScore / casesToRun.length);
  console.log(`  ✅ Average Score: ${avgScore}/100`);

  return {
    provider: `${provider}/${model}`,
    averageScore: avgScore,
    cases: results,
    strengths: [],
    weaknesses: []
  };
}

/**
 * Save result to file
 */
function saveResult(result: EvalResult, outputDir: string) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${result.provider.replace(/\//g, '-')}-${result.caseName}.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
}

/**
 * Run comparison across all configured providers
 */
async function runComparison(options: RunOptions) {
  console.log('\n🔬 Running provider comparison...\n');

  const providers: { provider: LLMProvider; model: string }[] = [
    { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
    { provider: 'anthropic', model: 'claude-3-opus-20240229' },
    { provider: 'openai', model: 'gpt-4-turbo-preview' },
    { provider: 'openai', model: 'gpt-4o' },
    // Add more providers as needed
  ];

  const comparisons: ProviderComparison[] = [];

  for (const { provider, model } of providers) {
    try {
      const comparison = await runProviderEval(provider, model, options);
      comparisons.push(comparison);
    } catch (error) {
      console.error(`  ❌ Failed to run ${provider}/${model}: ${error}`);
    }
  }

  // Generate and save comparison matrix
  const matrix = generateComparisonMatrix(comparisons);
  const matrixPath = path.join(options.outputDir!, 'comparison-matrix.md');
  fs.writeFileSync(matrixPath, matrix);

  console.log(`\n📊 Comparison matrix saved to: ${matrixPath}`);
  console.log('\n' + matrix);
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();

  if (options.compareAll) {
    await runComparison(options);
  } else if (options.provider && options.model) {
    const result = await runProviderEval(options.provider, options.model, options);
    
    console.log('\n📊 Results:');
    console.log(`  Provider: ${result.provider}`);
    console.log(`  Average Score: ${result.averageScore}/100`);
    console.log('\n  Case Breakdown:');
    for (const c of result.cases) {
      const status = c.passed ? '✅' : '❌';
      console.log(`    ${status} ${c.caseName}: ${c.score}/100`);
    }
  } else {
    console.error('Error: Must specify --provider and --model, or use --compare-all');
    printHelp();
    process.exit(1);
  }
}

main().catch(console.error);
