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

// Types
export type { SkillFrontmatter, GeneratedSkill } from './generators/types.js';
