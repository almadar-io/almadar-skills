/**
 * Behavior Catalog Section
 *
 * Generates a catalog of all standard behaviors grouped by level (atoms, molecules, organisms).
 * Loads data dynamically from @almadar/std, never hardcoded.
 *
 * @packageDocumentation
 */

import type { OrbitalSchema, TraitRef, Trait } from '@almadar/core';
import { getAllBehaviors } from '@almadar/std';
import { classifyBehavior } from './classify.js';

/** Narrow a TraitRef to an inline Trait. */
function isInlineTrait(traitRef: TraitRef): traitRef is Trait {
    return typeof traitRef === 'object' && traitRef !== null && 'stateMachine' in traitRef;
}

/** Extract description from a behavior, falling back to orbital/trait name. */
function extractDescription(schema: OrbitalSchema): string {
    if (schema.description) return schema.description;

    const orbitals = schema.orbitals;
    if (!orbitals || orbitals.length === 0) return 'No description available';

    const traits = orbitals[0].traits;
    if (traits && traits.length > 0) {
        const firstInline = traits.find(isInlineTrait);
        if (firstInline && typeof firstInline.name === 'string') {
            return `Behavior: ${firstInline.name}`;
        }
    }

    if (typeof orbitals[0].name === 'string') {
        return `Orbital: ${orbitals[0].name}`;
    }

    return 'No description available';
}

/**
 * Generate a markdown catalog of all standard behaviors, grouped by level.
 */
export function getBehaviorCatalogSection(): string {
    const allBehaviors = getAllBehaviors() as OrbitalSchema[];

    const atoms: OrbitalSchema[] = [];
    const molecules: OrbitalSchema[] = [];
    const organisms: OrbitalSchema[] = [];

    for (const b of allBehaviors) {
        const level = classifyBehavior(b.name);
        if (level === 'atoms') atoms.push(b);
        else if (level === 'molecules') molecules.push(b);
        else organisms.push(b);
    }

    const formatList = (behaviors: OrbitalSchema[]): string =>
        behaviors.map(b => `- \`${b.name}\`: ${extractDescription(b)}`).join('\n');

    return `## Behavior Catalog (${allBehaviors.length} behaviors)

### Atoms (${atoms.length})
Self-contained, irreducible state machines. Building blocks for molecules.

${formatList(atoms)}

### Molecules (${molecules.length})
Compose atoms via extractTrait + shared event bus. Mid-complexity behaviors.

${formatList(molecules)}

### Organisms (${organisms.length})
Compose atoms/molecules via connect/compose/pipe. Full application patterns.

${formatList(organisms)}`;
}
