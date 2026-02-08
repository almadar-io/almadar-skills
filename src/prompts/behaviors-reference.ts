/**
 * Behaviors Reference
 *
 * Helper for generating standard behaviors documentation from @almadar/std.
 *
 * @packageDocumentation
 */

import { generateBehaviorsDocs } from '@almadar/std';

/**
 * Get key behaviors reference (compact).
 * Uses @almadar/std to generate the behaviors documentation.
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
