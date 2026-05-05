/**
 * Behavior Catalog Section (Phase 7.1 — composition-first)
 *
 * Emits atoms, molecules, AND organisms. Atoms/molecules are listed with
 * full trait wiring because the LLM composes them. Organisms are listed
 * as name + one-line description only — they are picked end-to-end as a
 * single `suggestedBehavior`, never composed from.
 *
 * For atom/molecule entries the LLM sees:
 *   - the import path under `uses:` (`std/behaviors/<name>`)
 *   - the derived alias (e.g. `std-browse` -> `Browse`)
 *   - every inline trait's `ref:` string (`Alias.traits.TraitName`)
 *   - each trait's emits/listens + scope, so the LLM knows the public
 *     API and which events it may remap via the trait-reference
 *     overrides (only external-scoped events are remappable; internal
 *     events must come from a sibling in the same orbital).
 *
 * Source of truth is the raw `.orb` files under `behaviors/registry/`
 * (canonical since Phase E, 2026-04-08). The installed `@almadar/std`
 * package ships that same folder at the package root. The legacy
 * `behaviors/exports/` layout was retired on 2026-04-17 and is no longer
 * read. Everything the LLM needs is emitted; nothing is fabricated when
 * missing.
 *
 * @packageDocumentation
 */

import { readdirSync, readFileSync, existsSync, realpathSync, statSync } from 'fs';
import { dirname, resolve, basename } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Types (narrowly typed from the .orb JSON we read off disk)
// ============================================================================

/** Narrow shape of a trait event contract / listener declaration. */
interface OrbEventContract {
    event?: unknown;
    scope?: unknown;
}

/** Narrow shape of an inline trait inside an .orb orbital. */
interface OrbInlineTrait {
    name?: unknown;
    description?: unknown;
    linkedEntity?: unknown;
    emits?: unknown;
    listens?: unknown;
    stateMachine?: unknown;
}

/** Narrow shape of a raw .orb schema — we only touch the fields we use. */
interface RawOrb {
    name?: unknown;
    description?: unknown;
    orbitals?: unknown;
}

// ============================================================================
// Filesystem resolution
// ============================================================================

/**
 * Narrow helper: does this `import.meta` expose the Node 20+ `resolve`
 * method? Avoids any cast by doing a real runtime type guard.
 */
function hasImportMetaResolve(
    meta: ImportMeta,
): meta is ImportMeta & { resolve(specifier: string): string } {
    // ImportMeta doesn't declare `resolve`, so we touch it via `in`.
    return 'resolve' in meta && typeof (meta as { resolve?: unknown }).resolve === 'function';
}

/**
 * Walk the `@almadar/std` package and return every `behaviors/registry/<topic>/<tier>`
 * directory (post-Phase-3.5.G layout, std 7.11+). Returns an empty array
 * when the std package isn't resolvable (e.g. tests in a detached
 * environment) so the caller can degrade gracefully. Also handles the
 * legacy flat layout (`behaviors/registry/<tier>`) as a fallback for
 * older std versions.
 *
 * Topics: core | agent | app | game | service | probes (+ any future tier).
 */
function resolveBehaviorTierDirs(tier: 'atoms' | 'molecules' | 'organisms'): string[] {
    let stdPkgRoot: string;
    try {
        if (!hasImportMetaResolve(import.meta)) return [];
        const url = import.meta.resolve('@almadar/std/behaviors/functions');
        const filePath = fileURLToPath(url);
        stdPkgRoot = realpathSync(resolve(dirname(filePath), '..', '..', '..'));
    } catch {
        return [];
    }

    const registryRoot = resolve(stdPkgRoot, 'behaviors', 'registry');
    if (!existsSync(registryRoot)) return [];

    const dirs: string[] = [];

    // Topic/tier layout (std 7.11+): registry/<topic>/<tier>/*.orb
    for (const topic of safeReaddir(registryRoot)) {
        const topicDir = resolve(registryRoot, topic);
        if (!isDir(topicDir)) continue;
        const tierDir = resolve(topicDir, tier);
        if (existsSync(tierDir) && isDir(tierDir)) dirs.push(tierDir);
    }

    // Legacy flat layout: registry/<tier>/*.orb (std 7.10 and earlier).
    // Older atoms / molecules / organisms might still live here when the
    // installed std version straddles the migration. Adding it as a
    // fallback costs nothing and keeps the catalog complete.
    const flatDir = resolve(registryRoot, tier);
    if (existsSync(flatDir) && isDir(flatDir)) dirs.push(flatDir);

    return dirs;
}

function safeReaddir(dir: string): string[] {
    try { return readdirSync(dir); } catch { return []; }
}

function isDir(path: string): boolean {
    try { return statSync(path).isDirectory(); } catch { return false; }
}

/**
 * Read every `.orb` file across all topic-scoped tier directories, parse
 * as JSON, and return `{ name, raw }` pairs. Silently skips files that
 * fail to parse — the catalog is best-effort metadata. Dedupes by file
 * basename when a behavior somehow appears under two topics.
 */
function loadTierOrbs(tier: 'atoms' | 'molecules' | 'organisms'): Array<{ name: string; raw: RawOrb }> {
    const dirs = resolveBehaviorTierDirs(tier);
    if (dirs.length === 0) return [];

    const seen = new Map<string, { name: string; raw: RawOrb }>();
    for (const dir of dirs) {
        for (const file of safeReaddir(dir)) {
            if (!file.endsWith('.orb')) continue;
            const fullPath = resolve(dir, file);
            try {
                const text = readFileSync(fullPath, 'utf-8');
                const raw = JSON.parse(text) as RawOrb;
                const name = basename(file, '.orb');
                if (!seen.has(name)) seen.set(name, { name, raw });
            } catch {
                // Bad JSON / unreadable — skip.
            }
        }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// Alias derivation
// ============================================================================

/**
 * Convert a behavior name into the PascalCase alias shown in `uses:`:
 *   std-browse       -> Browse
 *   std-agent-memory -> AgentMemory
 *   std-form-advanced -> FormAdvanced
 */
function behaviorNameToAlias(name: string): string {
    const stripped = name.startsWith('std-') ? name.slice(4) : name;
    return stripped
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

// ============================================================================
// Trait extraction
// ============================================================================

interface TraitInfo {
    traitName: string;
    description: string;
    emits: Array<{ event: string; scope: 'internal' | 'external' }>;
    listens: Array<{ event: string; scope: 'internal' | 'external' }>;
}

function isInlineTraitRecord(value: unknown): value is OrbInlineTrait {
    if (!value || typeof value !== 'object') return false;
    // Narrow via OrbInlineTrait — the local interface we already defined —
    // so we never reach for a bag-of-unknowns Record<>.
    const rec = value as OrbInlineTrait;
    return typeof rec.name === 'string' && ('stateMachine' in rec || 'emits' in rec || 'listens' in rec);
}

function coerceScope(raw: unknown): 'internal' | 'external' {
    // Per @almadar/core EventScope, undefined scope defaults to 'internal'.
    return raw === 'external' ? 'external' : 'internal';
}

function extractEventContracts(raw: unknown): Array<{ event: string; scope: 'internal' | 'external' }> {
    if (!Array.isArray(raw)) return [];
    const out: Array<{ event: string; scope: 'internal' | 'external' }> = [];
    for (const entry of raw) {
        if (!entry || typeof entry !== 'object') continue;
        const rec = entry as OrbEventContract;
        if (typeof rec.event !== 'string' || !rec.event) continue;
        out.push({ event: rec.event, scope: coerceScope(rec.scope) });
    }
    return out;
}

/**
 * Extract every inline trait from an orbital schema's first orbital.
 * Returns one TraitInfo per trait. Ignores trait references (string
 * or `{ ref: ... }`) since they carry no inline emit/listen data —
 * molecules that reference atoms still declare their own traits
 * alongside those references.
 */
function extractTraits(raw: RawOrb): TraitInfo[] {
    if (!Array.isArray(raw.orbitals) || raw.orbitals.length === 0) return [];
    const first = raw.orbitals[0];
    if (!first || typeof first !== 'object') return [];
    const orbital = first as { traits?: unknown };
    if (!Array.isArray(orbital.traits)) return [];

    const traits: TraitInfo[] = [];
    for (const t of orbital.traits) {
        if (!isInlineTraitRecord(t)) continue;
        const name = typeof t.name === 'string' ? t.name : '';
        if (!name) continue;
        const description = typeof t.description === 'string' ? t.description : '';
        traits.push({
            traitName: name,
            description,
            emits: extractEventContracts(t.emits),
            listens: extractEventContracts(t.listens),
        });
    }
    return traits;
}

// ============================================================================
// Rendering
// ============================================================================

function renderTier(
    tier: 'Atoms' | 'Molecules' | 'Organisms',
    tierKey: 'atoms' | 'molecules' | 'organisms',
    entries: Array<{ name: string; raw: RawOrb }>,
): string {
    if (entries.length === 0) {
        return `## ${tier}\n\n_(none available)_`;
    }

    const lines: string[] = [];
    lines.push(`## ${tier} (${entries.length})`);
    lines.push('');
    if (tier === 'Atoms') {
        lines.push(
            'Atoms are self-contained, irreducible state machines. Compose them directly inside an orbital to build bespoke flows.',
        );
    } else if (tier === 'Molecules') {
        lines.push(
            'Molecules compose atoms with pre-wired event buses. Use a molecule as-is when its declared external surface matches the task; otherwise compose atoms directly.',
        );
    } else {
        lines.push(
            'Organisms are whole-app templates that already include their full set of orbitals + cross-orbital wiring. Pick one as a single-name `suggestedBehavior` (no `composition` block, no atoms list) when the user prompt names the organism\'s domain end-to-end. Each entry is name + one-line description; internal trait/event detail is omitted because you do not compose organisms — you instantiate one.',
        );
    }
    lines.push('');

    for (const entry of entries) {
        const alias = behaviorNameToAlias(entry.name);
        const tierSingular = tierKey === 'atoms' ? 'atom' : tierKey === 'molecules' ? 'molecule' : 'organism';
        const description =
            typeof entry.raw.description === 'string' ? entry.raw.description.split('\n')[0] : '';

        lines.push(`- **${entry.name}** (${tierSingular}, from: \`std/behaviors/${entry.name}\`, alias: \`${alias}\`)`);
        if (description) {
            // Keep descriptions short — truncate long single lines to ~160 chars
            // on word boundaries. Never truncates trait/emit/listen data.
            const trimmed = description.length > 160 ? description.slice(0, 157).replace(/\s+\S*$/, '') + '...' : description;
            lines.push(`  ${trimmed}`);
        }

        // Organisms: stop after name + description. They are not composed
        // from outside, so the LLM doesn't need their inner trait wiring;
        // showing it would just multiply token cost without changing the
        // pick-by-domain decision.
        if (tier === 'Organisms') {
            lines.push('');
            continue;
        }

        const traits = extractTraits(entry.raw);
        if (traits.length === 0) {
            // No inline traits — molecule that purely references atoms.
            // Emit no Traits: block rather than fabricate one.
            lines.push('');
            continue;
        }

        lines.push('  Traits:');
        for (const trait of traits) {
            const ref = `${alias}.traits.${trait.traitName}`;
            const descSuffix = trait.description ? ` — ${trait.description.split('\n')[0]}` : '';
            lines.push(`    ${ref}${descSuffix}`);
            if (trait.emits.length > 0) {
                const emitStr = trait.emits.map((e) => `${e.event} (${e.scope})`).join(', ');
                lines.push(`      Emits:   ${emitStr}`);
            }
            if (trait.listens.length > 0) {
                const listenStr = trait.listens.map((l) => `${l.event} (${l.scope})`).join(', ');
                lines.push(`      Listens: ${listenStr}`);
            }
        }
        lines.push('');
    }

    return lines.join('\n').replace(/\n+$/, '');
}

/**
 * Generate the behavior catalog — atoms, molecules, and organisms.
 * Atoms and molecules carry full trait wiring detail because the LLM
 * composes them. Organisms are listed by name + one-liner only because
 * they're picked end-to-end as a single `suggestedBehavior`, never
 * composed from.
 */
export function getBehaviorCatalogSection(): string {
    const atoms = loadTierOrbs('atoms');
    const molecules = loadTierOrbs('molecules');
    const organisms = loadTierOrbs('organisms');

    const header = `# Behavior Catalog

Three tiers, each with a different use:
  - **Atoms**: irreducible state machines. Compose with \`uses:\` + inline \`traits:\`.
  - **Molecules**: pre-wired compositions of atoms. Use as-is when their external surface matches.
  - **Organisms**: whole-app templates (multiple orbitals + cross-orbital wiring). Pick one by name as a single \`suggestedBehavior\` when the user's prompt names the organism's full domain. No composition needed.

Atoms and molecules show full trait wiring (refs, emits, listens) because you compose them. Organisms show name + one-line description only because you instantiate them, not compose from them.

Scope rules (atoms/molecules):
  - \`internal\`: a sibling trait in the same orbital emits (or listens for) this event. You cannot remap internal-scoped events via a trait-reference's \`events:\` override — the compiler rejects it.
  - \`external\`: the event crosses the orbital boundary. You may remap it via \`events: { OLD: "NEW" }\` on the trait reference.
`;

    return [
        header,
        renderTier('Atoms', 'atoms', atoms),
        '',
        renderTier('Molecules', 'molecules', molecules),
        '',
        renderTier('Organisms', 'organisms', organisms),
    ].join('\n');
}
