/**
 * Types for the Almadar Skills evaluation framework
 */

/** A single eval case — one JSON file */
export interface EvalCase {
  /** Unique identifier */
  id: string;

  /** Human-readable description */
  description: string;

  /** The natural language prompt to send to the skill */
  prompt: string;

  /** Semantic expectations (checked by LLM-as-judge) */
  semanticExpectations: string[];

  /** Tags for filtering (e.g., "basic", "game", "edge-case") */
  tags?: string[];

  /** Provider/model override for this case */
  model?: string;
}

/** CLI validation result */
export interface CLIValidationResult {
  /** Whether validation passed */
  pass: boolean;

  /** CLI output */
  output: string;

  /** Errors if validation failed */
  errors?: string[];
}

/** Semantic validation result */
export interface SemanticValidationResult {
  /** Whether semantic validation passed */
  pass: boolean;

  /** Score from 0-1 */
  score: number;

  /** Per-expectation results */
  expectations: Array<{
    expectation: string;
    met: boolean;
    reasoning: string;
  }>;

  /** Overall reasoning for the score */
  overallReasoning: string;
}

/** Full result for one eval case */
export interface EvalResult {
  /** Case ID */
  caseId: string;

  /** Overall pass/fail */
  pass: boolean;

  /** Aggregate score (0-1) */
  score: number;

  /** CLI validation result */
  cliValidation: CLIValidationResult;

  /** Semantic validation result */
  semanticValidation: SemanticValidationResult;

  /** Raw LLM output */
  rawOutput: string;

  /** Token usage */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /** Latency in ms */
  latencyMs: number;
}

/** Per-category statistics */
export interface CategoryStats {
  /** Pass rate for this category */
  passRate: number;

  /** Average score for this category */
  avgScore: number;

  /** Number of test cases in this category */
  count: number;
}

/** Aggregated report across all cases */
export interface EvalReport {
  /** Timestamp */
  timestamp: string;

  /** Model used */
  model: string;

  /** Skill version */
  skillVersion: string;

  /** Overall pass rate */
  passRate: number;

  /** Average score */
  averageScore: number;

  /** Per-category breakdown */
  categories: Record<string, CategoryStats>;

  /** Individual results */
  results: EvalResult[];

  /** Total cost estimate */
  totalCost: string;
}

/** Options for running evals */
export interface RunOptions {
  /** Glob pattern for case files (default: all) */
  filter?: string;

  /** Tags to include */
  tags?: string[];

  /** LLM provider override */
  provider?: 'openai' | 'anthropic' | 'deepseek';

  /** Model override */
  model?: string;

  /** Max concurrent eval cases */
  concurrency?: number;

  /** Output format */
  format?: 'text' | 'json' | 'markdown';
}
