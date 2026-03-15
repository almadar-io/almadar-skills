/**
 * Converter Skill Generator
 *
 * Generates the converter skill for the Almadar Converter agent.
 * The converter agent converts existing source code projects or
 * live websites to .orb orbital schemas.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';

/**
 * Generate the converter skill.
 */
export function generateConverterSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'converter',
    description: 'Convert existing source code projects or live websites to .orb orbital schemas',
    allowedTools: [
      'extract_source', 'extract_crawl',
      'match_behavior', 'use_behavior', 'build_orbital',
      'connect_behaviors', 'compose_app', 'verify_app',
    ],
    version: '1.0.0',
  };

  const content = `
# Almadar Converter Agent

You convert existing TypeScript/JavaScript projects into .orb orbital schemas.

## Workflow

1. **Extract**: Call \`extract_source\` with the project path to get a SourceSnapshot
2. **Read**: Examine the SourceSnapshot — entities, routes, API routes, state management
3. **Match**: For each entity, call \`match_behavior\` with a description of the entity's usage pattern
4. **Instantiate**: For each matched entity:
   - If matched → call \`use_behavior\` with the behavior name, entity name, and fields JSON (FAST, 0 LLM)
   - If not matched → call \`build_orbital\` with a shell schema (SLOW, 40+ LLM calls, FALLBACK ONLY)
5. **Connect**: If entities have cross-entity relationships, call \`connect_behaviors\` to wire events
6. **Compose**: Call \`compose_app\` to combine all orbitals into the final schema
7. **Verify**: If requested, call \`verify_app\` to run round-trip verification
8. **Retry**: If verify fails, read failures, fix the specific orbital, recompose, reverify (max 2 retries)

## Tools

- \`extract_source\`: Extract entities, routes, APIs, state from source code (deterministic for TS, agent-driven for other languages)
- \`match_behavior\`: Find matching std behavior for an entity (1 LLM call)
- \`use_behavior\`: Instantiate a behavior with custom entity + fields (0 LLM calls, PREFERRED)
- \`build_orbital\`: Full gate pipeline for novel patterns (40+ LLM calls, FALLBACK)
- \`connect_behaviors\`: Wire cross-orbital events between emitter and listener (0 LLM calls)
- \`compose_app\`: Combine all orbitals into final multi-page app schema (0 LLM calls)
- \`verify_app\`: Compile + serve + browser test (0 LLM calls)

## Rules

- ALWAYS try \`use_behavior\` first via \`match_behavior\`. Only \`build_orbital\` as fallback.
- When calling \`use_behavior\`, provide \`fieldsJson\` as a JSON string array:
  '[{"name":"title","type":"string","required":true},{"name":"status","type":"enum","values":["active","done"],"required":true}]'
- Set \`persistence\` to "persistent" for entities with database backing, "runtime" otherwise.
- Always call \`compose_app\` before \`verify_app\`.
- Read verify failures carefully and fix only the broken orbital.

## Behavior Matching Guidelines

When deciding which behavior matches an entity, consider:

| Pattern | Behavior | Key Indicators |
|---------|----------|---------------|
| List + CRUD operations | \`std-list\` | GET (list), POST, PUT, DELETE API routes; browse/create/edit states |
| Detail view | \`std-detail\` | GET (single) route with :id param; view-only display |
| Multi-step form / wizard | \`std-wizard\` | Sequential steps, stages, or phases in UI |
| Shopping cart / checkout | \`std-cart\` | Add/remove items, quantity, checkout flow |
| Static display | \`std-display\` | Read-only data presentation, no CRUD |
| Search functionality | \`std-search\` | Search input, filter, query results |
| Notification / alerts | \`std-notification\` | Push notifications, alerts, toasts |
| Timer / countdown | \`std-timer\` | Time-based state, countdown, duration |

## Cross-Entity Connection Patterns

Look for these signals in the SourceSnapshot to identify connections:

- Field names ending in \`Id\` (e.g., \`authorId\`, \`categoryId\`) → relation
- Import statements between entity modules → dependency
- Shared event names in state management → event connection
- Foreign key patterns in Prisma/ORM → emits/listens wiring
`.trim();

  return {
    name: 'converter',
    frontmatter,
    content,
  };
}
