/**
 * Behavior Atom Reference Section
 *
 * Generates a detailed reference for atom-level behaviors. Reads raw
 * `.orb` files from the installed std package's
 * `behaviors/registry/<topic>/atoms/` tree (with legacy flat-layout
 * fallback). Atoms own their state-machine topology and carry it inline
 * in the .orb source, so reading the raw file gives the analyzer LLM
 * real semantic info — states, events, emits, listens — instead of bare
 * names.
 *
 * @packageDocumentation
 */

import {
    loadTierBehaviors,
    extractInlineTraits,
    getBehaviorDescription,
    type LoadedBehavior,
    type InlineTraitInfo,
} from './behavior-loader.js';

function renderTraitLine(t: InlineTraitInfo): string {
    const parts: string[] = [];
    if (t.states.length > 0) parts.push(`states: ${t.states.join(', ')}`);
    if (t.events.length > 0) parts.push(`events: ${t.events.join(', ')}`);
    const emitsExt = t.emits.filter((e) => e.scope === 'external').map((e) => e.event);
    if (emitsExt.length > 0) parts.push(`emits(ext): ${emitsExt.join(', ')}`);
    const listensExt = t.listens.filter((l) => l.scope === 'external').map((l) => l.event);
    if (listensExt.length > 0) parts.push(`listens(ext): ${listensExt.join(', ')}`);
    return parts.length > 0 ? `  - ${t.traitName} — ${parts.join('; ')}` : `  - ${t.traitName}`;
}

function renderBehavior(b: LoadedBehavior): string {
    const traits = extractInlineTraits(b.raw);
    const desc = getBehaviorDescription(b.raw);
    const lines: string[] = [];
    lines.push(`#### \`${b.name}\``);
    if (desc) lines.push(desc);
    if (traits.length === 0) {
        lines.push('- (no inline traits — references atoms via `uses:`)');
    } else {
        for (const t of traits) lines.push(renderTraitLine(t));
    }
    return lines.join('\n');
}

/**
 * Generate a detailed reference for all atom behaviors. Atoms are
 * self-contained, irreducible state machines — exactly the shape the
 * LLM picks for single-primitive prompts.
 */
export function getBehaviorAtomReference(): string {
    const atoms = loadTierBehaviors('atoms');
    if (atoms.length === 0) {
        return '### Atom Reference\n\nNo atoms found.';
    }

    return [
        `### Atom Reference (${atoms.length})`,
        '',
        'Atoms are self-contained, irreducible state machines. Each atom handles one concern. Pick an atom when the prompt is a single primitive (browse, list, dialog, gallery). Compose multiple atoms in one orbital when the prompt layers two primitives.',
        '',
        atoms.map(renderBehavior).join('\n\n'),
    ].join('\n');
}
