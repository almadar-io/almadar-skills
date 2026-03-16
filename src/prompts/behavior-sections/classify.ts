/**
 * Behavior Classification Helpers
 *
 * Shared utilities for classifying behaviors into atoms/molecules/organisms
 * and extracting trait data from behavior schemas.
 *
 * @packageDocumentation
 */

/**
 * Known atom behavior names. Atoms are self-contained, irreducible state machines.
 * Derived from the behaviors/functions/atoms/ directory in @almadar/std source.
 */
const ATOM_NAMES = new Set([
    'std-browse', 'std-modal', 'std-confirmation', 'std-search', 'std-filter',
    'std-sort', 'std-pagination', 'std-drawer', 'std-notification', 'std-timer',
    'std-tabs', 'std-loading', 'std-selection', 'std-undo', 'std-input',
    'std-wizard', 'std-display', 'std-async', 'std-combat', 'std-gameflow',
    'std-movement', 'std-quest', 'std-overworld', 'std-circuit-breaker',
    'std-cache-aside', 'std-score', 'std-collision', 'std-physics2d',
    'std-rate-limiter', 'std-game-hud', 'std-score-board', 'std-game-menu',
    'std-game-over-screen', 'std-dialogue-box', 'std-inventory-panel',
    'std-combat-log', 'std-sprite', 'std-game-audio', 'std-isometric-canvas',
    'std-platformer-canvas', 'std-simulation-canvas', 'std-game-canvas-2d',
    'std-game-canvas-3d',
]);

/**
 * Known molecule behavior names. Molecules compose atoms via extractTrait + shared event bus.
 */
const MOLECULE_NAMES = new Set([
    'std-list', 'std-cart', 'std-detail', 'std-inventory', 'std-messaging',
    'std-geospatial', 'std-turn-based-battle', 'std-platformer-game',
    'std-puzzle-game', 'std-builder-game', 'std-classifier-game',
    'std-sequencer-game', 'std-debugger-game', 'std-negotiator-game',
    'std-simulator-game', 'std-event-handler-game',
]);

/** Classify a behavior into atom/molecule/organism based on its name. */
export function classifyBehavior(name: string): 'atoms' | 'molecules' | 'organisms' {
    if (ATOM_NAMES.has(name)) return 'atoms';
    if (MOLECULE_NAMES.has(name)) return 'molecules';
    return 'organisms';
}

/** Extract trait state/event data from a behavior schema's first orbital. */
export function extractTraitData(schema: { orbitals?: Array<Record<string, unknown>> }): {
    states: string[];
    events: string[];
    emits: string[];
    listens: string[];
} {
    const orbitals = schema.orbitals;
    if (!orbitals || orbitals.length === 0) {
        return { states: [], events: [], emits: [], listens: [] };
    }

    const traits = orbitals[0].traits as Array<Record<string, unknown>> | undefined;
    if (!traits || traits.length === 0) {
        return { states: [], events: [], emits: [], listens: [] };
    }

    const trait = traits[0];
    const sm = trait.stateMachine as Record<string, unknown> | undefined;

    const states = (sm?.states as Array<{ name: string }> | undefined)
        ?.map(s => s.name) ?? [];
    const events = (sm?.events as Array<{ key: string }> | undefined)
        ?.map(e => e.key) ?? [];
    const emits = (trait.emits as Array<{ event: string }> | undefined)
        ?.map(e => e.event) ?? [];
    const listens = (trait.listens as Array<{ event: string }> | undefined)
        ?.map(l => l.event) ?? [];

    return { states, events, emits, listens };
}
