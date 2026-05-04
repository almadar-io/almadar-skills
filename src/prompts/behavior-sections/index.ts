/**
 * Behavior Sections Index
 *
 * Pure functions that generate markdown/text sections for the behaviors skill.
 * All data is loaded dynamically from @almadar/std.
 *
 * @packageDocumentation
 */

export { getBehaviorCatalogSection } from './behavior-catalog.js';
export { getBehaviorAtomReference } from './behavior-atom-reference.js';
export { getBehaviorMoleculeReference } from './behavior-molecule-reference.js';
export { getBehaviorOrganismReference } from './behavior-organism-reference.js';
export { getBehaviorCompositionGuide } from './behavior-composition-guide.js';
export { getBehaviorEventContractsSection } from './behavior-event-contracts.js';
export { getCrossOrbitalWiringGuide } from './cross-orbital-wiring-guide.js';

// Phase 7.2 — slot + scope vocabulary
export {
    getSlotVocabularySection,
    getScopeVocabularySection,
} from './slots-and-scopes.js';

// Phase 7.4 + 7.5 — few-shot examples and common compositions
// (common compositions replaced the retired domain-behavior-mapping table)
export {
    getFewShotExamplesSection,
    getCommonCompositionsSection,
} from './few-shot-examples.js';

// Atom-composition recipe path — the molecule-vs-atom decision rule,
// the recipe schema, the canonical recipe cookbook (core/ atoms only),
// and the override-surface guide.
export { getMoleculeVsAtomDecisionRule } from './molecule-vs-atom-decision.js';
export { getAtomCompositionRecipeSection } from './atom-composition-recipe.js';
export { getRecipeCookbook } from './recipe-cookbook.js';
export { getEventRenameAndConfigGuide } from './event-rename-config-guide.js';
