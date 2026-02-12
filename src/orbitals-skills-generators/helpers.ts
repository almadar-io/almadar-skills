/**
 * Helper functions for generating skill content from @almadar packages.
 * These generate markdown sections by importing from @almadar/* packages.
 * 
 * @packageDocumentation
 */

import { getAllBehaviors, getAllStdOperators, generateBehaviorsDocs, generateModulesDocs } from '@almadar/std';
import { PATTERN_TYPES } from '@almadar/core/types';
import { getPatternsGroupedByCategory } from '@almadar/patterns';

/**
 * Get minimal type reference (patterns, slots, operators).
 */
export function getMinimalTypeReference(): string {
  const patternsByCategory = getPatternsGroupedByCategory();
  const categories = Object.keys(patternsByCategory);
  
  return `## Type Reference

### Pattern Types
${categories.map(cat => `- **${cat}**: ${patternsByCategory[cat].slice(0, 5).join(', ')}...`).join('\n')}

Total: ${PATTERN_TYPES.length} patterns

### Operators
Use S-expressions for guards and effects. See std library for full list.

**Math**: \`+\`, \`-\`, \`*\`, \`/\`, \`>\`, \`<\`, \`>=\`, \`<=\`, \`=\`, \`!=\`
**Logic**: \`and\`, \`or\`, \`not\`
**Effects**: \`set\`, \`++\`, \`--\`, \`persist\`, \`fetch\`, \`emit\`, \`render-ui\`
`;
}

/**
 * Get S-Expression quick reference.
 */
export function getSExprQuickRef(): string {
  return `## S-Expression Syntax

**Bindings** (read data):
- \`@entity.field\` - Entity field value
- \`@payload.data\` - Event payload data
- \`@state\` - Current state name
- \`@now\` - Current timestamp

**Guards** (boolean expressions):
\`\`\`json
[">", "@entity.count", 0]
["and", ["=", "@state", "Active"], ["<", "@entity.value", 100]]
\`\`\`

**Effects** (actions):
\`\`\`json
["set", "@entity.count", ["+", "@entity.count", 1]]
["persist", "update", "Task", "@entity.id", "@payload.data"]
["emit", "TASK_COMPLETED", { "id": "@entity.id" }]
\`\`\`
`;
}

/**
 * Get render-ui quick reference.
 */
export function getRenderUIQuickRef(): string {
  return `## Render-UI Reference

**Syntax**: \`["render-ui", slot, config]\`

**Slots**: \`main\`, \`modal\`, \`drawer\`, \`sidebar\`, \`hud-top\`, \`hud-bottom\`

**Example**:
\`\`\`json
["render-ui", "main", {
  "type": "entity-table",
  "entity": "Task",
  "columns": ["title", "status"]
}]
\`\`\`

Clear a slot: \`["render-ui", "modal", null]\`
`;
}

/**
 * Get std library minimal reference.
 */
export function getStdMinimalReference(): string {
  const operators = getAllStdOperators();
  return `## Standard Library

**Operators**: ${operators.length} total

**Key Categories**:
- Math: \`clamp\`, \`lerp\`, \`random\`, \`abs\`, \`min\`, \`max\`
- String: \`concat\`, \`upper\`, \`lower\`, \`trim\`, \`split\`
- Array: \`filter\`, \`map\`, \`find\`, \`contains\`, \`length\`
- Time: \`now\`, \`format\`, \`diff\`, \`isPast\`, \`isFuture\`

Import with: \`uses: [{ from: "std/operators/math", as: "Math" }]\`
`;
}

/**
 * Get std library full reference.
 */
export function getStdFullReference(): string {
  const modulesDocs = generateModulesDocs();
  return `## Standard Library (Full Reference)

${modulesDocs.modules.map(mod => `### ${mod.name}
${mod.description}

${mod.operators.map(op => `- **${op.name}**: ${op.description}`).join('\n')}
`).join('\n')}
`;
}

/**
 * Get std behaviors with state machines.
 */
export function getStdBehaviorsWithStateMachines(): string {
  const behaviors = getAllBehaviors();
  const nonGameBehaviors = behaviors.filter(b => {
    const traits = b.orbitals?.[0]?.traits ?? [];
    const hasGameCategory = traits.some((t: any) => t.category?.includes('game'));
    const hasStateMachine = traits.some((t: any) => t.stateMachine);
    return !hasGameCategory && hasStateMachine;
  });

  return `## Standard Behaviors

${nonGameBehaviors.map(behavior => {
    const trait = (behavior.orbitals?.[0]?.traits ?? []).find((t: any) => t.stateMachine) as any;
    const sm = trait?.stateMachine;
    return `### ${behavior.name}

**States**: ${sm?.states?.map((s: any) => s.name).join(', ') ?? 'N/A'}
**Events**: ${sm?.events?.map((e: any) => e.key ?? e.name ?? e).join(', ') ?? 'N/A'}

\`\`\`json
${JSON.stringify(behavior, null, 2)}
\`\`\`
`;
  }).join('\n\n')}
`;
}

/**
 * Get key behaviors reference (compact).
 */
export function getKeyBehaviorsReference(): string {
  const behaviorsDocs = generateBehaviorsDocs();
  
  return `## Key Standard Behaviors

${behaviorsDocs.categories.map(cat => `### ${cat.name}
${cat.behaviors.map(b => `- **${b.name}**: ${b.description}`).join('\n')}
`).join('\n')}

Use with: \`uses: [{ from: "std/behaviors/crud", as: "CRUD" }]\`
`;
}
