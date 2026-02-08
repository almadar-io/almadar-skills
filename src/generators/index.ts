/**
 * Skill Generators for Builder Client
 *
 * Re-exports the 5 core skills used by the builder client:
 * 1. kflow-orbitals (standard JSON generation)
 * 2. kflow-orbital-fixing (standard fixing)
 * 3. kflow-lean-orbitals (lean domain language generation)
 * 4. kflow-lean-fixing (lean fixing)
 * 5. domain-language (ODL understanding/summarization)
 *
 * @packageDocumentation
 */

// Types
export type { SkillFrontmatter, GeneratedSkill } from './types.js';

// Utilities
export { formatFrontmatter, writeSkill, writeAllSkills } from './utils.js';

// Core skills used by builder client
export { generateKflowOrbitalsSkill } from './kflow-orbitals.js';
export { generateKflowOrbitalFixingSkill } from './kflow-orbital-fixing.js';
export { generateDomainLanguageSkill } from './domain-language.js';

// Lean skills (domain language output)
export { generateLeanOrbitalSkill } from '../orbitals-skills-generators/lean/lean-orbital-generator.js';
export { generateLeanFixingSkill } from '../orbitals-skills-generators/lean/lean-fixing-generator.js';

// Orbital skill generators (used by kflow-orbitals and kflow-orbital-fixing)
export { generateLeanOrbitalSkill as generateLeanOrbitalSkillFull } from '../orbitals-skills-generators/lean-orbital-skill-generator.js';
export { generateLeanFixingSkill as generateLeanFixingSkillFull } from '../orbitals-skills-generators/lean-fixing-skill-generator.js';

// Import generators for generateAllBuilderSkills
import type { GeneratedSkill } from './types.js';
import { generateKflowOrbitalsSkill } from './kflow-orbitals.js';
import { generateKflowOrbitalFixingSkill } from './kflow-orbital-fixing.js';
import { generateDomainLanguageSkill } from './domain-language.js';
import { generateLeanOrbitalSkill } from '../orbitals-skills-generators/lean/lean-orbital-generator.js';
import { generateLeanFixingSkill } from '../orbitals-skills-generators/lean/lean-fixing-generator.js';

/**
 * Generate all builder client skills.
 * These are the 5 skills actually used by the builder UI.
 */
export function generateAllBuilderSkills(): GeneratedSkill[] {
  return [
    generateKflowOrbitalsSkill(),
    generateKflowOrbitalFixingSkill(),
    {
      name: 'kflow-lean-orbitals',
      frontmatter: {
        name: 'kflow-lean-orbitals',
        description: 'Generate schemas using Domain Language (~5x fewer tokens)',
        allowedTools: ['Read', 'Write', 'Edit'],
      },
      content: generateLeanOrbitalSkill(),
    },
    {
      name: 'kflow-lean-fixing',
      frontmatter: {
        name: 'kflow-lean-fixing',
        description: 'Fix validation errors using Domain Language',
        allowedTools: ['Read', 'Write', 'Edit'],
      },
      content: generateLeanFixingSkill(),
    },
    generateDomainLanguageSkill(),
  ];
}
