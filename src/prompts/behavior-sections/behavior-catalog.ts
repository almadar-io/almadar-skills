/**
 * Behavior Catalog Section (Phase 7.1 — composition-first)
 *
 * Emits atoms and molecules only. Organisms are top-level apps, not
 * composable parts — they are filtered out entirely.
 *
 * For every behavior the LLM sees:
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

import { readdirSync, readFileSync, existsSync, realpathSync } from 'fs';
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
 * Walk the `@almadar/std` package and return a list of `.orb` file paths
 * for the given tier (atoms / molecules) from the canonical
 * `behaviors/registry/<tier>` tree. Returns `null` when the std package
 * isn't resolvable (e.g. tests in a detached environment) so the caller
 * can degrade gracefully.
 */
function resolveBehaviorTierDir(tier: 'atoms' | 'molecules'): string | null {
    let stdPkgRoot: string;
    try {
        // `import.meta.resolve` works on Node 20+ and returns a file:// URL
        // to the resolved module. We resolve the behaviors/functions subpath
        // since that's in the std package's `exports` map.
        if (!hasImportMetaResolve(import.meta)) return null;
        const url = import.meta.resolve('@almadar/std/behaviors/functions');
        const filePath = fileURLToPath(url);
        // filePath is dist/behaviors/functions/index.js; walk up to package root.
        stdPkgRoot = realpathSync(resolve(dirname(filePath), '..', '..', '..'));
    } catch {
        return null;
    }

    const registryDir = resolve(stdPkgRoot, 'behaviors', 'registry', tier);
    if (existsSync(registryDir)) return registryDir;

    return null;
}

/**
 * Read every `.orb` file in the given tier directory, parse as JSON,
 * and return `{ name, raw }` pairs. Silently skips files that fail to
 * parse — the catalog is best-effort metadata.
 */
function loadTierOrbs(tier: 'atoms' | 'molecules'): Array<{ name: string; raw: RawOrb }> {
    const dir = resolveBehaviorTierDir(tier);
    if (!dir) return [];

    const entries: Array<{ name: string; raw: RawOrb }> = [];
    for (const file of readdirSync(dir)) {
        if (!file.endsWith('.orb')) continue;
        const fullPath = resolve(dir, file);
        try {
            const text = readFileSync(fullPath, 'utf-8');
            const raw = JSON.parse(text) as RawOrb;
            const name = basename(file, '.orb');
            entries.push({ name, raw });
        } catch {
            // Bad JSON / unreadable — skip.
        }
    }
    // Stable alphabetical order so prompt output is deterministic.
    entries.sort((a, b) => a.name.localeCompare(b.name));
    return entries;
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
    tier: 'Atoms' | 'Molecules',
    tierKey: 'atoms' | 'molecules',
    entries: Array<{ name: string; raw: RawOrb }>,
): string {
    if (entries.length === 0) {
        return `## ${tier}\n\n_(none available)_`;
    }

    const lines: string[] = [];
    lines.push(`## ${tier} (${entries.length})`);
    lines.push('');
    lines.push(
        tier === 'Atoms'
            ? 'Atoms are self-contained, irreducible state machines. Compose them directly inside an orbital to build bespoke flows.'
            : 'Molecules compose atoms with pre-wired event buses. Use a molecule as-is when its declared external surface matches the task; otherwise compose atoms directly.',
    );
    lines.push('');

    for (const entry of entries) {
        const alias = behaviorNameToAlias(entry.name);
        const tierSingular = tierKey === 'atoms' ? 'atom' : 'molecule';
        const description =
            typeof entry.raw.description === 'string' ? entry.raw.description.split('\n')[0] : '';

        lines.push(`- **${entry.name}** (${tierSingular}, from: \`std/behaviors/${entry.name}\`, alias: \`${alias}\`)`);
        if (description) {
            // Keep descriptions short — truncate long single lines to ~160 chars
            // on word boundaries. Never truncates trait/emit/listen data.
            const trimmed = description.length > 160 ? description.slice(0, 157).replace(/\s+\S*$/, '') + '...' : description;
            lines.push(`  ${trimmed}`);
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
 * Generate the behavior catalog — atoms and molecules only.
 * Organisms are excluded; they are top-level apps, not composable parts.
 */
export function getBehaviorCatalogSection(): string {
    const atoms = loadTierOrbs('atoms');
    const molecules = loadTierOrbs('molecules');

    const header = `# Behavior Catalog

Atoms and molecules you may compose via \`uses:\` + \`traits:\` in an \`.orb\` program. Organisms are omitted — they're top-level apps, not composable parts.

Each entry shows:
  - the behavior's import path (\`from:\`) and the alias you use to reference it (\`as:\`)
  - every inline trait's \`ref:\` string (\`Alias.traits.TraitName\`)
  - each trait's declared \`emits\` / \`listens\` with scope

Scope rules:
  - \`internal\`: a sibling trait in the same orbital emits (or listens for) this event. You cannot remap internal-scoped events via a trait-reference's \`events:\` override — the compiler rejects it.
  - \`external\`: the event crosses the orbital boundary. You may remap it via \`events: { OLD: "NEW" }\` on the trait reference.
`;

    return [
        header,
        renderTier('Atoms', 'atoms', atoms),
        '',
        renderTier('Molecules', 'molecules', molecules),
    ].join('\n');
}
