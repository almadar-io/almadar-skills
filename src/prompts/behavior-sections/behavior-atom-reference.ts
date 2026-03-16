/**
 * Behavior Atom Reference Section
 *
 * Generates a detailed reference for atom-level behaviors.
 * Extracts states, events, and metadata from the .orb data.
 *
 * @packageDocumentation
 */

import { getAllBehaviors } from '@almadar/std';
import { classifyBehavior, extractTraitData } from './classify.js';

/**
 * Generate a detailed reference for all atom behaviors.
 */
export function getBehaviorAtomReference(): string {
    const allBehaviors = getAllBehaviors() as Array<{ name: string; description?: string; orbitals?: Array<Record<string, unknown>>; [key: string]: unknown }>;
    const atoms = allBehaviors.filter(b => classifyBehavior(b.name) === 'atoms');

    if (atoms.length === 0) {
        return '### Atom Reference\n\nNo atoms found.';
    }

    const entries = atoms.map(schema => {
        const { states, events } = extractTraitData(schema);
        const desc = schema.description ?? '';

        const lines: string[] = [];
        lines.push(`#### \`${schema.name}\``);
        if (desc) lines.push(desc);
        lines.push(`- **States**: ${states.length > 0 ? states.join(', ') : 'none'}`);
        lines.push(`- **Events**: ${events.length > 0 ? events.join(', ') : 'none'}`);
        return lines.join('\n');
    });

    return `### Atom Reference (${atoms.length})

Atoms are self-contained, irreducible state machines. Each atom handles a single concern.

${entries.join('\n\n')}`;
}
