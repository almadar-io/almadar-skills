/**
 * Behavior Molecule Reference Section
 *
 * Generates a detailed reference for molecule-level behaviors. Reads raw
 * `.orb` files from `behaviors/registry/<topic>/molecules/`. Molecules
 * compose atoms via `uses:` + trait `ref:` and pre-wired event buses, so
 * we surface their composition (which atoms they pull in) plus any
 * inline traits they add on top.
 *
 * @packageDocumentation
 */

import {
    loadTierBehaviors,
    extractInlineTraits,
    getBehaviorDescription,
    type LoadedBehavior,
} from './behavior-loader.js';

interface UseEntry {
    from: string;
    as: string;
}

function extractUses(raw: LoadedBehavior['raw']): UseEntry[] {
    if (!Array.isArray(raw.orbitals) || raw.orbitals.length === 0) return [];
    const first = raw.orbitals[0];
    if (!first || typeof first !== 'object') return [];
    const orbital = first as { uses?: unknown };
    if (!Array.isArray(orbital.uses)) return [];
    const out: UseEntry[] = [];
    for (const u of orbital.uses) {
        if (!u || typeof u !== 'object') continue;
        const rec = u as { from?: unknown; as?: unknown };
        if (typeof rec.from === 'string' && typeof rec.as === 'string') {
            out.push({ from: rec.from, as: rec.as });
        }
    }
    return out;
}

function renderBehavior(b: LoadedBehavior): string {
    const desc = getBehaviorDescription(b.raw);
    const uses = extractUses(b.raw);
    const traits = extractInlineTraits(b.raw);

    const lines: string[] = [];
    lines.push(`#### \`${b.name}\``);
    if (desc) lines.push(desc);
    if (uses.length > 0) {
        const composed = uses.map((u) => u.from.replace(/^std\/behaviors\//, '')).join(' + ');
        lines.push(`- composes: ${composed}`);
    }
    for (const t of traits) {
        const parts: string[] = [];
        if (t.states.length > 0) parts.push(`states: ${t.states.join(', ')}`);
        if (t.events.length > 0) parts.push(`events: ${t.events.join(', ')}`);
        const emitsExt = t.emits.filter((e) => e.scope === 'external').map((e) => e.event);
        if (emitsExt.length > 0) parts.push(`emits(ext): ${emitsExt.join(', ')}`);
        lines.push(parts.length > 0 ? `- ${t.traitName} — ${parts.join('; ')}` : `- ${t.traitName}`);
    }
    return lines.join('\n');
}

/**
 * Generate a detailed reference for all molecule behaviors. Molecules
 * are mid-complexity flows that compose multiple atoms with cross-atom
 * event wiring.
 */
export function getBehaviorMoleculeReference(): string {
    const molecules = loadTierBehaviors('molecules');
    if (molecules.length === 0) {
        return '### Molecule Reference\n\nNo molecules found.';
    }

    return [
        `### Molecule Reference (${molecules.length})`,
        '',
        'Molecules compose multiple atoms via `uses:` + shared event buses. Pick a molecule when the prompt describes a complete mid-scope flow (cart, list-with-detail, calendar booking) — its declared external surface should match the task. Otherwise compose atoms directly.',
        '',
        molecules.map(renderBehavior).join('\n\n'),
    ].join('\n');
}
