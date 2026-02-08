/**
 * Lean Fixing Skill Generator
 *
 * Generates a minimal, focused fixing skill by:
 * 1. Reusing the same sections as lean-orbital-skill-generator
 * 2. Adding fixing-specific guidance on top
 * 3. Keeping the same modular structure
 *
 * @packageDocumentation
 */

import {
    getMinimalTypeReference,
    getSExprQuickRef,
    getRenderUIQuickRef,
} from './helpers.js';
import { getPatternActionsRef } from '@almadar/patterns';
import {
    getArchitectureSection,
    getCommonErrorsSection,
    getSchemaUpdateSection,
    // Fixing-specific sections
    getFixingWorkflowSection,
    getCommonFixPatternsSection,
    getOverGenerationSection,
    getEfficiencySection,
    getCompletionRulesSection,
} from '../prompts/skill-sections/index.js';

// ============================================================================
// Generator Options
// ============================================================================

export interface LeanFixingSkillOptions {
    /** Include over-generation detection */
    includeOverGeneration?: boolean;
    /** Include schema update guidance */
    includeSchemaUpdates?: boolean;
    /** Include efficiency guidelines */
    includeEfficiency?: boolean;
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate a lean fixing skill.
 *
 * This produces a fixing skill that reuses the lean orbital sections
 * and adds fixing-specific guidance.
 */
export function generateLeanFixingSkill(options: LeanFixingSkillOptions = {}): string {
    const {
        includeOverGeneration = true,
        includeSchemaUpdates = true,
        includeEfficiency = true,
    } = options;

    return `# Orbital Fixing Skill

> Fix validation errors using orbital understanding: Entity × Traits × Patterns

## Key Principle

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│  When fixing errors:                                                 │
│  1. Identify which ORBITAL the error belongs to                      │
│  2. Identify which COMPONENT (entity/trait/page/pattern)             │
│  3. Apply targeted fix for that component                            │
│                                                                      │
│  This gives you CONTEXT that improves fix accuracy.                  │
└─────────────────────────────────────────────────────────────────────┘
\`\`\`

---

${getFixingWorkflowSection()}

${includeEfficiency ? `---

${getEfficiencySection()}` : ''}

---

${getArchitectureSection()}

---

${getMinimalTypeReference()}

---

${getSExprQuickRef()}

---

${getRenderUIQuickRef()}

---

${getPatternActionsRef()}

---

${getCommonFixPatternsSection()}

${includeOverGeneration ? `---

${getOverGenerationSection()}` : ''}

---

${getCommonErrorsSection()}

${includeSchemaUpdates ? `---

${getSchemaUpdateSection()}` : ''}

---

${getCompletionRulesSection()}

---

## Schema File Rule

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│  ALWAYS write to: schema.json                                        │
│                                                                      │
│  NEVER use other file names like:                                   │
│  - schema_with_fixes.json  ❌                                        │
│  - new_schema.json         ❌                                        │
│  - updated_schema.json     ❌                                        │
│                                                                      │
│  The persistence system ONLY reads from schema.json                 │
└─────────────────────────────────────────────────────────────────────┘
\`\`\`
`;
}

// ============================================================================
// Stat Export (for testing)
// ============================================================================

/**
 * Get skill stats for comparison.
 */
export function getLeanFixingSkillStats(options: LeanFixingSkillOptions = {}): { lines: number; chars: number } {
    const skill = generateLeanFixingSkill(options);
    return {
        lines: skill.split('\n').length,
        chars: skill.length,
    };
}

/**
 * Get fixing skill metadata.
 */
export function getFixingSkillMetadata() {
    return {
        name: 'kflow-orbital-fixing',
        description: 'Fix validation errors using orbital understanding (lean version)',
        version: '2.0.0',
    };
}

/**
 * Get fixing skill name.
 */
export function getFixingSkillName(): string {
    return 'kflow-orbital-fixing';
}
