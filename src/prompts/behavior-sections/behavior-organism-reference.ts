/**
 * Behavior Organism Reference Section
 *
 * Generates a detailed reference for organism-level behaviors. Reads raw
 * `.orb` files from `behaviors/registry/<topic>/organisms/`. Organisms
 * are full applications composed of multiple orbitals connected by
 * cross-orbital event wiring; we surface their orbital count and the
 * topic so the analyzer LLM can match prompts to the right organism
 * (marketplace, booking, cms, etc.).
 *
 * @packageDocumentation
 */

import { loadTierBehaviors, getBehaviorDescription, type LoadedBehavior } from './behavior-loader.js';

function countOrbitals(b: LoadedBehavior): number {
    return Array.isArray(b.raw.orbitals) ? b.raw.orbitals.length : 0;
}

function listOrbitalNames(b: LoadedBehavior): string[] {
    if (!Array.isArray(b.raw.orbitals)) return [];
    return b.raw.orbitals
        .map((o) => (o && typeof o === 'object' ? (o as { name?: unknown }).name : undefined))
        .filter((n): n is string => typeof n === 'string');
}

function renderBehavior(b: LoadedBehavior): string {
    const desc = getBehaviorDescription(b.raw);
    const orbCount = countOrbitals(b);
    const orbNames = listOrbitalNames(b);

    const lines: string[] = [];
    lines.push(`#### \`${b.name}\`${b.topic ? ` _(${b.topic})_` : ''}`);
    if (desc) lines.push(desc);
    lines.push(`- orbitals (${orbCount}): ${orbNames.join(', ')}`);
    return lines.join('\n');
}

/**
 * Generate a detailed reference for all organism behaviors. Organisms
 * are full applications — pick one when the prompt describes an entire
 * domain (marketplace, clinic booking, CMS, healthcare, helpdesk).
 */
export function getBehaviorOrganismReference(): string {
    const organisms = loadTierBehaviors('organisms');
    if (organisms.length === 0) {
        return '### Organism Reference\n\nNo organisms found.';
    }

    return [
        `### Organism Reference (${organisms.length})`,
        '',
        "Organisms are complete applications composed of multiple orbitals with cross-orbital event wiring. Pick an organism when the prompt describes an entire domain — 'build a marketplace' / 'clinic booking system' / 'internal CMS'. Going lower-tier than the prompt warrants forces the agent to assemble what std already ships.",
        '',
        organisms.map(renderBehavior).join('\n\n'),
    ].join('\n');
}
