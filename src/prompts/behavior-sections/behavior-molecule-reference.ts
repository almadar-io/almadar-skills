/**
 * Behavior Molecule Reference Section
 *
 * Generates a detailed reference for molecule-level behaviors.
 * Extracts states, events, and metadata from the .orb data.
 *
 * @packageDocumentation
 */

import { getAllBehaviors } from '@almadar/std';
import { classifyBehavior, extractTraitData } from './classify.js';

/**
 * Generate a detailed reference for all molecule behaviors.
 */
export function getBehaviorMoleculeReference(): string {
    const allBehaviors = getAllBehaviors() as Array<{ name: string; description?: string; orbitals?: Array<Record<string, unknown>>; [key: string]: unknown }>;
    const molecules = allBehaviors.filter(b => classifyBehavior(b.name) === 'molecules');

    if (molecules.length === 0) {
        return '### Molecule Reference\n\nNo molecules found.';
    }

    const entries = molecules.map(schema => {
        const { states, events } = extractTraitData(schema);
        const desc = schema.description ?? '';

        const lines: string[] = [];
        lines.push(`#### \`${schema.name}\``);
        if (desc) lines.push(desc);
        lines.push(`- **States**: ${states.length > 0 ? states.join(', ') : 'none'}`);
        lines.push(`- **Events**: ${events.length > 0 ? events.join(', ') : 'none'}`);
        return lines.join('\n');
    });

    return `### Molecule Reference (${molecules.length})

Molecules compose atoms via extractTrait and shared event buses. They handle mid-complexity interaction patterns.

${entries.join('\n\n')}`;
}
