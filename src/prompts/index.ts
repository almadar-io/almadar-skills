/**
 * Prompts Module
 *
 * Reusable skill sections for composing AI skills.
 * These sections are combined with imports from @almadar/* packages
 * to generate complete skills.
 *
 * @packageDocumentation
 */

// ============================================================================
// Skill Sections (Reusable Guidance)
// ============================================================================

export * from './skill-sections/index.js';

// ============================================================================
// Generation Prompts (Composed from Skill Sections)
// ============================================================================

export {
  getOrbitalDecompositionPrompt,
  getFullOrbitalPrompt,
  getRequirementsDecomposePrompt,
  getRequirementsTraitPrompt,
} from './generation-prompts.js';

// ============================================================================
// Type References (From @almadar packages)
// ============================================================================

export {
  getMinimalTypeReference,
  getPatternTypesCompact,
  getSExprQuickRef,
  getRenderUIQuickRef,
  getFieldTypesCompact,
} from './type-references.js';
