/**
 * Skill Sections Index
 *
 * Lean, focused sections for orbital skill generation.
 *
 * @packageDocumentation
 */

export { getArchitectureSection } from "./architecture.js";
export {
  getCommonErrorsSection,
  getValidationHintsSection,
} from "./common-errors.js";
export {
  getDecompositionSection,
  getDecompositionCompact,
  getDecompositionChecklist,
  getConnectivityCompact,
  // UX Enhancement sections
  getFlowPatternSection,
  getPortableOrbitalOutputSection,
  getOrbitalConnectivitySection,
} from "./decomposition.js";

// Pattern design guide (render-ui design guide)
export { getRenderUIDesignGuide } from "./pattern-design-guide.js";
export { getThemeGuide, getBannedProps } from "./theme-guide.js";
export {
  getCustomTraitSection,
  getCustomTraitCompact,
} from "./custom-traits.js";
export {
  getSchemaUpdateSection,
  getSchemaUpdateCompact,
} from "./schema-updates.js";

// Context usage sections (UX Enhancement)
export {
  getContextUsageSection,
  getContextUsageCompact,
} from "./context-usage.js";

// Design-specific sections
export {
  getDesignErrorsSection,
  getDesignErrorsCompact,
  getIconLibrarySection,
  getIconLibraryCompact,
} from "./design-errors.js";

// Fixing-specific sections
export {
  getFixingWorkflowSection,
  getCommonFixPatternsSection,
  getOverGenerationSection,
  getEfficiencySection,
  getCompletionRulesSection,
} from "./fixing-guidance.js";

// Game-specific sections
export {
  getGameAsOrbitalsSection,
  getGameEntityTemplatesSection,
  getGameTraitsSection,
  getGamePatternsSection,
  getAssetRefSection,
  getMultiFileSection,
  getGameTypesSection,
} from "./game-guidance.js";

// Uses Import System
export { getUsesImportSection, getUsesImportCompact } from "./uses-imports.js";
