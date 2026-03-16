/**
 * Skill Generators for Builder Client
 *
 * Re-exports the 6 core skills used by the builder client:
 * 1. kflow-orbitals (standard JSON generation with atomic composition)
 * 2. kflow-orbital-fixing (standard fixing)
 * 3. kflow-lean-orbitals (lean domain language generation)
 * 4. kflow-lean-fixing (lean fixing)
 * 5. domain-language (ODL understanding/summarization)
 * 6. almadar-assistant (company/platform Q&A knowledge assistant)
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
export { generateAlmadarAssistantSkill } from './almadar-assistant.js';
export { generateConverterSkill } from './converter.js';

// Orb skill (molecule-first, for Masar pipeline and LLM generation)
export { generateOrbSkill } from './orb.js';

// Behaviors skill (compose standard library behaviors into apps)
export { generateBehaviorsSkill } from './behaviors.js';

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
import { generateAlmadarAssistantSkill } from './almadar-assistant.js';
import { generateOrbSkill } from './orb.js';
import { generateConverterSkill } from './converter.js';
import { generateBehaviorsSkill } from './behaviors.js';
import { generateLeanOrbitalSkill } from '../orbitals-skills-generators/lean/lean-orbital-generator.js';
import { generateLeanFixingSkill } from '../orbitals-skills-generators/lean/lean-fixing-generator.js';

/**
 * Generate all builder client skills.
 * These are the 6 skills actually used by the builder UI.
 */
export function generateAllBuilderSkills(): GeneratedSkill[] {
  return [
    generateOrbSkill(),
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
    generateAlmadarAssistantSkill(),
    generateBehaviorsSkill(),
  ];
}
