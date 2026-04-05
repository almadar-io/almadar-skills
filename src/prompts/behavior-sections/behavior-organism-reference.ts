/**
 * Behavior Organism Reference Section
 *
 * Generates a detailed reference for organism-level behaviors.
 * Extracts states, events, and metadata from the .orb data.
 *
 * @packageDocumentation
 */

import { getAllBehaviors } from '@almadar/std';
import { classifyBehavior, extractTraitData } from './classify.js';
import type { BehaviorSchemaEntry } from './classify.js';

/**
 * Generate a detailed reference for all organism behaviors.
 */
export function getBehaviorOrganismReference(): string {
    const allBehaviors = getAllBehaviors() as BehaviorSchemaEntry[];
    const organisms = allBehaviors.filter(b => classifyBehavior(b.name) === 'organisms');

    if (organisms.length === 0) {
        return '### Organism Reference\n\nNo organisms found.';
    }

    const entries = organisms.map(schema => {
        const { states, events } = extractTraitData(schema);
        const desc = schema.description ?? '';

        const lines: string[] = [];
        lines.push(`#### \`${schema.name}\``);
        if (desc) lines.push(desc);
        lines.push(`- **States**: ${states.length > 0 ? states.join(', ') : 'none'}`);
        lines.push(`- **Events**: ${events.length > 0 ? events.join(', ') : 'none'}`);
        return lines.join('\n');
    });

    return `### Organism Reference (${organisms.length})

Organisms compose atoms and molecules via connect/compose/pipe. They represent full application patterns.

${entries.join('\n\n')}`;
}
