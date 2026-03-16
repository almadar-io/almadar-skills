/**
 * Behavior Event Contracts Section
 *
 * Generates a section listing emits/listens for all behaviors.
 * Loaded dynamically from @almadar/std registry.
 *
 * @packageDocumentation
 */

import { getAllBehaviors } from '@almadar/std';

/**
 * Behavior schema entry shape from getAllBehaviors.
 */
interface BehaviorEntry {
    name: string;
    orbitals?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}

/** Extract all emits and listens from all traits in a behavior schema. */
function extractEventContracts(schema: BehaviorEntry): {
    emits: string[];
    listens: string[];
} {
    const allEmits: string[] = [];
    const allListens: string[] = [];

    const orbitals = schema.orbitals;
    if (!orbitals) return { emits: allEmits, listens: allListens };

    for (const orbital of orbitals) {
        const traits = orbital.traits as Array<Record<string, unknown>> | undefined;
        if (!traits) continue;

        for (const trait of traits) {
            const emits = trait.emits as Array<{ event: string }> | undefined;
            if (emits) {
                for (const e of emits) {
                    if (e.event && !allEmits.includes(e.event)) {
                        allEmits.push(e.event);
                    }
                }
            }

            const listens = trait.listens as Array<{ event: string }> | undefined;
            if (listens) {
                for (const l of listens) {
                    if (l.event && !allListens.includes(l.event)) {
                        allListens.push(l.event);
                    }
                }
            }
        }
    }

    return { emits: allEmits, listens: allListens };
}

/**
 * Generate a section listing event contracts (emits/listens) for all behaviors.
 * Skips behaviors that have no emits and no listens.
 */
export function getBehaviorEventContractsSection(): string {
    const behaviors = getAllBehaviors() as BehaviorEntry[];

    const entries: string[] = [];
    for (const schema of behaviors) {
        const { emits, listens } = extractEventContracts(schema);
        if (emits.length === 0 && listens.length === 0) continue;

        const parts: string[] = [];
        if (emits.length > 0) parts.push(`emits [${emits.join(', ')}]`);
        if (listens.length > 0) parts.push(`listens [${listens.join(', ')}]`);

        entries.push(`- \`${schema.name}\`: ${parts.join(', ')}`);
    }

    if (entries.length === 0) {
        return `## Event Contracts\n\nNo behaviors with emits or listens found.`;
    }

    return `## Event Contracts

Behaviors communicate via events. Each behavior declares what it emits and what it listens to.
Wire matching emits to listens when composing behaviors.

${entries.join('\n')}`;
}
