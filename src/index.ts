/**
 * @almadar/skills
 *
 * AI skill generators and prompts for Orbital schema generation.
 * This package provides the core skills used by the KFlow builder client.
 *
 * @packageDocumentation
 */

// Main exports - generators and prompts
export * from './generators/index.js';
export * from './prompts/index.js';

// Convenience re-exports for common use cases
export { generateKflowOrbitalsSkill } from './generators/kflow-orbitals.js';
export { generateKflowOrbitalFixingSkill } from './generators/kflow-orbital-fixing.js';
export { generateDomainLanguageSkill } from './generators/domain-language.js';
export { generateLeanOrbitalSkill } from './orbitals-skills-generators/lean/lean-orbital-generator.js';
export { generateLeanFixingSkill } from './orbitals-skills-generators/lean/lean-fixing-generator.js';

// Helper functions (used by tools and generators)
export { getKeyBehaviorsReference } from './prompts/behaviors-reference.js';

// Evaluation framework
export {
  analyzeComposition,
  calculateTotalScore,
  EVAL_CASES,
  generateComparisonMatrix,
  type EvalCase,
  type EvalResult,
  type ScoreBreakdown,
  type CompositionMetrics,
  type ProviderComparison
} from './evals/composition-quality.js';

// Types
export type { SkillFrontmatter, GeneratedSkill } from './generators/types.js';
