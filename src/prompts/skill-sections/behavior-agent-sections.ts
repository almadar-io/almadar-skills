/**
 * Behavior Agent Skill Sections
 *
 * Dynamic prompt sections for the behavior-driven agent.
 * Pulls data from @almadar/std (behaviors), @almadar/patterns (pattern props),
 * and @almadar/core (builder signatures). No hardcoded lists.
 *
 * @packageDocumentation
 */

import {
  getBehaviorsByDomain,
  getBehaviorsByOperations,
  getBehaviorSummary,
  getBehaviorRegistry,
  loadGoldenOrb,
  type RegistryEntry,
  type BehaviorSummary,
} from '@almadar/std';
import { getOrbAllowedPatterns } from '@almadar/patterns';

// ============================================================================
// Coordinator Sections
// ============================================================================

/**
 * Behavior catalog for the coordinator prompt.
 * Lists behaviors at a level with name, description, operations.
 */
export function getBehaviorCatalogForAgent(level?: 'atom' | 'molecule' | 'organism'): string {
  const registry = getBehaviorRegistry();
  const entries = Object.values(registry)
    .filter(b => !level || b.level === level)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (entries.length === 0) return '## Behavior Catalog\n\nNo behaviors found.';

  const byLevel: Record<string, RegistryEntry[]> = {};
  for (const e of entries) {
    if (!byLevel[e.level]) byLevel[e.level] = [];
    byLevel[e.level].push(e);
  }

  let output = '## Behavior Catalog\n\n';
  for (const [lvl, behaviors] of Object.entries(byLevel)) {
    output += `### ${lvl}s (${behaviors.length})\n\n`;
    output += '| Name | Domain | Operations | Complexity |\n';
    output += '|------|--------|-----------|------------|\n';
    for (const b of behaviors) {
      const ops = b.connectableEvents.slice(0, 4).join(', ');
      const cx = `${b.complexity.states}S/${b.complexity.events}E/${b.complexity.transitions}T`;
      const desc = b.family || b.layer;
      output += `| \`${b.name}\` | ${desc} | ${ops} | ${cx} |\n`;
    }
    output += '\n';
  }

  return output;
}

/**
 * Behavior detail for the subagent prompt.
 * Returns the behavior summary + the render-ui trees from the .orb file.
 */
export function getBehaviorDetailForSubagent(name: string): string {
  const summary = getBehaviorSummary(name);
  if (!summary) return `## Behavior: ${name}\n\nBehavior not found.`;

  let output = `## Behavior Reference: ${name}\n\n`;
  output += `Level: ${summary.level}\n`;
  output += `States: ${summary.states.join(', ')}\n`;
  output += `Events: ${summary.events.join(', ')}\n`;
  output += `Slots: ${summary.slots.join(', ')}\n`;
  output += `Patterns: ${summary.patterns.join(', ')}\n`;
  output += `Complexity: ${summary.complexity.states} states, ${summary.complexity.events} events, ${summary.complexity.transitions} transitions\n`;

  // Load the actual .orb and extract render-ui trees
  const orb = loadGoldenOrb(name);
  if (orb) {
    const renderUis = extractRenderUiTrees(orb);
    if (renderUis.length > 0) {
      output += '\n### Render-UI Trees\n\n';
      for (const { slot, event, tree } of renderUis) {
        output += `**${event} → ${slot}**:\n`;
        output += '```json\n' + JSON.stringify(tree, null, 2) + '\n```\n\n';
      }
    }
  }

  return output;
}

/**
 * Composition operations reference from @almadar/core builders.
 */
export function getBehaviorCompositionOpsRef(): string {
  return `## Composition Operations

These are deterministic tools. The LLM decides WHAT to compose, these handle HOW.

| Tool | Purpose | Key args |
|------|---------|----------|
| \`call_behavior\` | Call behavior function directly (stdList, stdCart, etc.) | behaviorName, params: { entityName, fields } |
| \`compose_orbitals\` | Assemble orbitals from .orbitals/ with layout + wiring | appName, outputPath, layoutStrategy?, eventWiring? |
| \`update_render_ui\` | Customize render-ui views with React subagent | orbitalName, entityName, fields, styleHint? |
| \`compose_behaviors\` | Assemble orbitals into a schema with layout + wiring | appName, orbitals, layoutStrategy?, eventWiring? |
| \`connect_orbitals\` | Wire cross-orbital events (A emits → B listens) | orbitalA, orbitalB, event, triggers? |
| \`merge_orbitals\` | Merge multiple behaviors into one orbital (shared entity) | name, entity, sources, pages |

### Layout strategies
- **single**: 1 orbital → 1 page
- **tabs**: 2-4 orbitals → tabbed navigation
- **sidebar**: 5+ orbitals → sidebar navigation
- **dashboard**: all orbitals on one page
- **wizard-flow**: sequential event chain detected`;
}

/**
 * Domain → behavior mapping from the registry.
 */
export function getBehaviorDomainMap(): string {
  const domains = ['UI Patterns', 'Game', 'Domain', 'Services', 'Infrastructure'];
  let output = '## Domain → Behavior Map\n\n';

  for (const domain of domains) {
    const behaviors = getBehaviorsByDomain(domain);
    if (behaviors.length === 0) continue;
    const names = behaviors.slice(0, 10).map(b => `\`${b.name}\``).join(', ');
    output += `**${domain}**: ${names}${behaviors.length > 10 ? ` (+${behaviors.length - 10} more)` : ''}\n\n`;
  }

  return output;
}

/**
 * Filtered pattern table: only patterns used by the selected behaviors.
 */
export function getBehaviorPatternSubset(behaviorNames: string[]): string {
  const allPatterns = new Set<string>();
  for (const name of behaviorNames) {
    const summary = getBehaviorSummary(name);
    if (summary) {
      for (const p of summary.patterns) allPatterns.add(p);
    }
  }

  if (allPatterns.size === 0) return '';

  // Get full props from pattern registry
  const groups = getOrbAllowedPatterns() as Record<string, Array<{ name: string; keyProps?: string[] }>>;
  let output = '## Available Patterns (from selected behaviors)\n\n';
  output += '| Pattern | Props |\n|---------|-------|\n';

  for (const [, patterns] of Object.entries(groups)) {
    for (const p of patterns) {
      if (allPatterns.has(p.name)) {
        const props = (p.keyProps ?? []).slice(0, 6).join(', ');
        output += `| \`${p.name}\` | ${props} |\n`;
      }
    }
  }

  // Check for patterns in behaviors but not in registry
  const registryPatterns = new Set<string>();
  for (const [, patterns] of Object.entries(groups)) {
    for (const p of patterns) registryPatterns.add(p.name);
  }
  const unmatched = Array.from(allPatterns).filter(p => !registryPatterns.has(p));
  if (unmatched.length > 0) {
    output += `\nAlso used in behaviors (no registry entry): ${unmatched.join(', ')}`;
  }

  return output;
}

/**
 * Behavior adaptation guide. Static content for entity rebinding rules.
 */
export function getBehaviorAdaptationGuide(): string {
  return `## Adaptation Guide

When adapting a behavior to a new entity:
- Replace the entity name (e.g., "ListItem" → "Task")
- Replace the collection name (plural lowercase: "listitems" → "tasks")
- Map fields by purpose: the behavior's default fields map to the target's fields
- Update trait name to match entity (e.g., "ListItemManagement" → "TaskManagement")
- Update page name and path (e.g., "/list-items" → "/tasks")
- Preserve the render-ui tree structure exactly — only change entity bindings (@entity.fieldName)
- Preserve all state machine transitions, events, and effects
- Preserve INIT transition with fetch + render-ui (never remove it)
- Preserve CANCEL/CLOSE transitions on modal/drawer states`;
}

// ============================================================================
// Helpers
// ============================================================================

interface RenderUiEntry {
  slot: string;
  event: string;
  tree: unknown;
}

function extractRenderUiTrees(schema: unknown): RenderUiEntry[] {
  const results: RenderUiEntry[] = [];
  const obj = schema as Record<string, unknown>;
  const orbitals = (obj.orbitals ?? []) as Array<Record<string, unknown>>;

  for (const orbital of orbitals) {
    const traits = (orbital.traits ?? []) as Array<Record<string, unknown>>;
    for (const trait of traits) {
      const sm = trait.stateMachine as Record<string, unknown> | undefined;
      if (!sm) continue;
      const transitions = (sm.transitions ?? []) as Array<Record<string, unknown>>;
      for (const t of transitions) {
        const effects = (t.effects ?? []) as unknown[];
        for (const effect of effects) {
          if (Array.isArray(effect) && effect.length >= 3 && effect[0] === 'render-ui' && effect[2] !== null) {
            results.push({
              slot: effect[1] as string,
              event: t.event as string,
              tree: effect[2],
            });
          }
        }
      }
    }
  }

  return results;
}
