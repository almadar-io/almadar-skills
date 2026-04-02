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
// .orb-specific render-ui guide (atoms/molecules only, derived from registry)
export { getOrbRenderUIGuide, getOrbRenderUIGuideFiltered } from "./orb-render-ui-guide.js";
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

// .orb language spec sections (for JEPA-guided subagent)
export {
  getCompositionRules,
  getOrbSyntaxSpec,
  getJepaPlanActionReference,
  getOrbErrorPatterns,
} from "./orb-language-spec.js";

// Binding documentation (source of truth from @almadar/core)
export {
  getBindingsGuide,
  getBindingsCompact,
  getBindingContextRules,
} from "./bindings-guide.js";

// Tool registry sections (for tooling skills)
export {
  getToolRegistrySection,
  getToolsByCategorySection,
  getSchemaLifecycleSection,
  getPatternPipelineSection,
  getVerificationSection,
  getProjectStructureSection,
} from "./tool-registry.js";
