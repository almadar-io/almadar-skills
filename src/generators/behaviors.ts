/**
 * Behaviors Skill Generator
 *
 * Generates the "behaviors" skill for selecting and composing
 * standard library behaviors into applications.
 *
 * All behavior data is loaded dynamically from @almadar/std.
 * No hardcoded behavior lists.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
    getBehaviorCatalogSection,
    getBehaviorAtomReference,
    getBehaviorMoleculeReference,
    getBehaviorOrganismReference,
    getBehaviorCompositionGuide,
    getBehaviorEventContractsSection,
    getDomainBehaviorMapping,
    getCrossOrbitalWiringGuide,
} from '../prompts/behavior-sections/index.js';

/**
 * Generate the "behaviors" skill.
 *
 * This skill teaches the agent to select and compose standard library
 * behaviors into complete applications.
 */
export function generateBehaviorsSkill(): GeneratedSkill {
    const frontmatter = {
        name: 'behaviors',
        description: 'Generate applications by selecting and composing behaviors from the standard library.',
        allowedTools: [
            'decompose_app',
            'match_behavior',
            'use_behavior',
            'connect_behaviors',
            'compose_behaviors',
            'verify_app',
            'finish_task',
        ],
        version: '1.0.0',
    };

    const content = `# Behaviors Composition Skill
> Select and compose behaviors from the standard library.

${getBehaviorCatalogSection()}

---

${getBehaviorCompositionGuide()}

---

${getBehaviorEventContractsSection()}

---

${getDomainBehaviorMapping()}

---

${getCrossOrbitalWiringGuide()}

---

## Detailed References

${getBehaviorAtomReference()}

---

${getBehaviorMoleculeReference()}

---

${getBehaviorOrganismReference()}
`;

    return {
        name: 'behaviors',
        frontmatter,
        content,
    };
}
