/**
 * KFlow Orbitals Skill Generator
 *
 * Generates the kflow-orbitals skill for orbital-based schema generation.
 * Uses the orbital skill generator from the orbitals module and adds
 * domain classification, interaction models, and trait-driven UI guidance.
 *
 * v4.0: Reduced from ~49K to ~15K by cutting std dump, schema-updates,
 * custom-traits, and half the errors. Added render-ui design guide with
 * pattern catalog and composition recipes.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import { generateLeanOrbitalSkill } from '../orbitals-skills-generators/lean-orbital-skill-generator.js';

/**
 * Generate the kflow-orbitals skill.
 *
 * Uses the lean orbital skill generator with minimal defaults (~15K).
 * The design guide, top-6 errors, and enriched example are always included.
 *
 * Options:
 * - compact: false (default) - Standard ~15K generation skill
 * - compact: true - Same (compact flag preserved for API compat, no-op now)
 */
export function generateKflowOrbitalsSkill(compact = false): GeneratedSkill {
  const frontmatter = {
    name: 'kflow-orbitals',
    description: 'Generate KFlow schemas using the Orbitals composition model. Decomposes applications into atomic Orbital Units (Entity x Traits x Patterns) with structural caching for efficiency.',
    allowedTools: ['Read', 'Write', 'Edit', 'generate_orbital', 'generate_schema_orchestrated', 'finish_task', 'query_schema_structure', 'extract_chunk', 'apply_chunk'],
    version: '5.0.0', // v5.0: atomic composition (removed design_transition, single-pass design)
  };

  // v4: Minimal skill with design guide (~15K).
  // - No std behaviors dump (saves 21K)
  // - No schema-updates (moved to fixing skill)
  // - No custom-traits (moved to fixing skill)
  // - Top 6 errors only (saves 4K)
  // - render-ui design guide with pattern catalog + composition recipes
  // - Enriched example with stats + searchable table
  const content = generateLeanOrbitalSkill({
    includeExample: true,
    includeToolWorkflow: true,
    includeStdStateMachines: false,
    includeSchemaUpdates: false,
    includeCustomTraits: false,
    errorLevel: 'top6',
    includeDesignGuide: true,
  });

  return {
    name: 'kflow-orbitals',
    frontmatter,
    content,
  };
}
