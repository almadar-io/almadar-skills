/**
 * Shared behavior-loader — reads raw `.orb` files from the installed
 * `@almadar/std` package's `behaviors/registry/<topic>/<tier>/` tree.
 *
 * Why raw files (not factory output): `getAllBehaviors()` from std returns
 * Phase-4.2 descriptor form where atoms / molecules / organisms expose
 * trait references (`{ ref, from, linkedEntity }`) — no inline state
 * machines or emit/listen contracts. The catalog + per-tier reference
 * helpers need that semantic info to teach the analyzer LLM what each
 * behavior actually does, so we read the raw `.orb` files directly. Atoms
 * own the state-machine topology and carry it inline in the .orb source.
 *
 * Layout: std 7.11+ uses `behaviors/registry/<topic>/<tier>/std-X.orb`
 * with topic ∈ core | agent | app | game | service | probes. Pre-7.11
 * used a flat `behaviors/registry/<tier>/std-X.orb` layout — kept as a
 * fallback so the loader works against either version.
 *
 * @packageDocumentation
 */

import { readdirSync, readFileSync, existsSync, realpathSync, statSync } from 'fs';
import { dirname, resolve, basename } from 'path';
import { fileURLToPath } from 'url';

export type BehaviorTier = 'atoms' | 'molecules' | 'organisms';

/** Narrow shape of a trait event contract / listener declaration. */
export interface OrbEventContract {
    event?: unknown;
    scope?: unknown;
}

/** Narrow shape of an inline trait inside an .orb orbital. */
export interface OrbInlineTrait {
    name?: unknown;
    description?: unknown;
    linkedEntity?: unknown;
    emits?: unknown;
    listens?: unknown;
    stateMachine?: unknown;
}

/** Narrow shape of a raw .orb schema — we only touch the fields we use. */
export interface RawOrb {
    name?: unknown;
    description?: unknown;
    orbitals?: unknown;
}

export interface LoadedBehavior {
    /** Behavior name (file basename without .orb). */
    name: string;
    /** Topic directory the file came from (core/agent/app/game/service/probes). */
    topic: string | null;
    /** Tier (atoms/molecules/organisms). */
    tier: BehaviorTier;
    /** Parsed JSON of the .orb file. */
    raw: RawOrb;
}

function hasImportMetaResolve(
    meta: ImportMeta,
): meta is ImportMeta & { resolve(specifier: string): string } {
    return 'resolve' in meta && typeof (meta as { resolve?: unknown }).resolve === 'function';
}

function safeReaddir(dir: string): string[] {
    try { return readdirSync(dir); } catch { return []; }
}

function isDir(path: string): boolean {
    try { return statSync(path).isDirectory(); } catch { return false; }
}

let cachedRegistryRoot: string | null | undefined;

/** Resolve `node_modules/@almadar/std/behaviors/registry`. Cached. */
export function resolveStdRegistryRoot(): string | null {
    if (cachedRegistryRoot !== undefined) return cachedRegistryRoot;
    try {
        if (!hasImportMetaResolve(import.meta)) {
            cachedRegistryRoot = null;
            return null;
        }
        const url = import.meta.resolve('@almadar/std/behaviors/functions');
        const filePath = fileURLToPath(url);
        const stdPkgRoot = realpathSync(resolve(dirname(filePath), '..', '..', '..'));
        const registryRoot = resolve(stdPkgRoot, 'behaviors', 'registry');
        cachedRegistryRoot = existsSync(registryRoot) ? registryRoot : null;
    } catch {
        cachedRegistryRoot = null;
    }
    return cachedRegistryRoot;
}

/**
 * Walk every `behaviors/registry/<topic>/<tier>/` directory under the
 * installed std package, plus the legacy flat `<tier>/` directory. Reads
 * every `.orb`, parses as JSON, dedupes by name. Result is sorted
 * alphabetically by name for deterministic prompt output.
 */
export function loadTierBehaviors(tier: BehaviorTier): LoadedBehavior[] {
    const registryRoot = resolveStdRegistryRoot();
    if (!registryRoot) return [];

    const seen = new Map<string, LoadedBehavior>();

    // Topic-scoped layout: registry/<topic>/<tier>/*.orb
    for (const topic of safeReaddir(registryRoot)) {
        const topicDir = resolve(registryRoot, topic);
        if (!isDir(topicDir)) continue;
        const tierDir = resolve(topicDir, tier);
        if (!existsSync(tierDir) || !isDir(tierDir)) continue;
        ingestDir(tierDir, topic, tier, seen);
    }

    // Legacy flat layout: registry/<tier>/*.orb (pre-7.11 stds).
    const flatDir = resolve(registryRoot, tier);
    if (existsSync(flatDir) && isDir(flatDir)) {
        ingestDir(flatDir, null, tier, seen);
    }

    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function ingestDir(
    dir: string,
    topic: string | null,
    tier: BehaviorTier,
    seen: Map<string, LoadedBehavior>,
): void {
    for (const file of safeReaddir(dir)) {
        if (!file.endsWith('.orb')) continue;
        const fullPath = resolve(dir, file);
        try {
            const text = readFileSync(fullPath, 'utf-8');
            const raw = JSON.parse(text) as RawOrb;
            const name = basename(file, '.orb');
            if (!seen.has(name)) seen.set(name, { name, topic, tier, raw });
        } catch {
            // Bad JSON / unreadable — skip.
        }
    }
}

// ============================================================================
// Trait extraction helpers (read from raw .orb inline traits)
// ============================================================================

function isInlineTraitRecord(value: unknown): value is OrbInlineTrait {
    if (!value || typeof value !== 'object') return false;
    const rec = value as OrbInlineTrait;
    return typeof rec.name === 'string' && ('stateMachine' in rec || 'emits' in rec || 'listens' in rec);
}

function coerceScope(raw: unknown): 'internal' | 'external' {
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

export interface InlineTraitInfo {
    traitName: string;
    description: string;
    states: string[];
    events: string[];
    emits: Array<{ event: string; scope: 'internal' | 'external' }>;
    listens: Array<{ event: string; scope: 'internal' | 'external' }>;
}

/**
 * Extract every inline trait from the FIRST orbital of an .orb schema.
 * Trait references (`{ ref: ..., from: ... }`) are skipped — only inline
 * traits carry the state machine + event contracts we expose to the LLM.
 *
 * Atoms always carry inline traits with state machines (atoms own
 * state-machine topology). Molecules/organisms typically reference atoms
 * via `uses:` + `ref:`, so their first orbital may have zero inline
 * traits — in that case the caller renders just the structural shell.
 */
export function extractInlineTraits(raw: RawOrb): InlineTraitInfo[] {
    if (!Array.isArray(raw.orbitals) || raw.orbitals.length === 0) return [];
    const first = raw.orbitals[0];
    if (!first || typeof first !== 'object') return [];
    const orbital = first as { traits?: unknown };
    if (!Array.isArray(orbital.traits)) return [];

    const out: InlineTraitInfo[] = [];
    for (const t of orbital.traits) {
        if (!isInlineTraitRecord(t)) continue;
        const name = typeof t.name === 'string' ? t.name : '';
        if (!name) continue;
        const description = typeof t.description === 'string' ? t.description : '';
        const sm = t.stateMachine as
            | { states?: Array<{ name?: unknown }>; events?: Array<{ key?: unknown }> }
            | undefined;
        const states = Array.isArray(sm?.states)
            ? sm!.states!.map((s) => (typeof s.name === 'string' ? s.name : '')).filter(Boolean)
            : [];
        const events = Array.isArray(sm?.events)
            ? sm!.events!.map((e) => (typeof e.key === 'string' ? e.key : '')).filter(Boolean)
            : [];
        out.push({
            traitName: name,
            description,
            states,
            events,
            emits: extractEventContracts(t.emits),
            listens: extractEventContracts(t.listens),
        });
    }
    return out;
}

/** First-orbital description fallback chain: schema description → first orbital description. */
export function getBehaviorDescription(raw: RawOrb): string {
    if (typeof raw.description === 'string' && raw.description.trim().length > 0) {
        return raw.description.trim();
    }
    if (Array.isArray(raw.orbitals) && raw.orbitals[0] && typeof raw.orbitals[0] === 'object') {
        const first = raw.orbitals[0] as { description?: unknown };
        if (typeof first.description === 'string' && first.description.trim().length > 0) {
            return first.description.trim();
        }
    }
    return '';
}
