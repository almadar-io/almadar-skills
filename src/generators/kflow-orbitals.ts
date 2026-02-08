/**
 * KFlow Orbitals Skill Generator
 *
 * Generates the kflow-orbitals skill for orbital-based schema generation.
 * Uses the orbital skill generator from the orbitals module and adds
 * domain classification, interaction models, and trait-driven UI guidance.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import { generateLeanOrbitalSkill } from '../orbitals-skills-generators/lean-orbital-skill-generator.js';

/**
 * Generate the kflow-orbitals skill.
 *
 * Uses the lean orbital skill generator which produces a ~90% smaller skill
 * by deriving prompts from types and using focused, minimal sections.
 *
 * Options:
 * - compact: false (default) - Include full std/* state machine examples (49K chars)
 * - compact: true - Exclude std/* examples for minimal size (24K chars)
 */
export function generateKflowOrbitalsSkill(compact = false): GeneratedSkill {
  const frontmatter = {
    name: 'kflow-orbitals',
    description: 'Generate KFlow schemas using the Orbitals composition model. Decomposes applications into atomic Orbital Units (Entity x Traits x Patterns) with structural caching for efficiency.',
    allowedTools: ['Read', 'Write', 'Edit'],
    version: '3.1.0', // Bumped version for compact option
  };

  // Use the lean orbital skill generator:
  // - Type-derived prompts (auto-sync with types)
  // - Focused architecture, errors, and decomposition sections
  // - Compact mode (~24K chars) vs Full mode (~49K chars)
  const content = generateLeanOrbitalSkill({
    includeExample: true,
    includeToolWorkflow: true,
    includeStdStateMachines: !compact, // Full std/* examples (21K chars)
  });

  return {
    name: 'kflow-orbitals',
    frontmatter,
    content,
  };
}
