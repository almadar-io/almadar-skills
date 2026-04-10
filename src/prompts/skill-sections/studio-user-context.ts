/**
 * Studio User Context Section
 *
 * Adapts agent tone and detail level based on studio persona.
 * Consumed by apps/builder server (NOT by orbital-agent-cli).
 *
 * @packageDocumentation
 */

/**
 * Get the user context prompt section for a studio persona.
 *
 * @param userType - Studio user type (builder, designer, architect, contributor)
 * @param disclosureLevel - Detail depth (1-4)
 * @returns Markdown section for system prompt, or empty string if no context
 */
export function getStudioUserContextSection(
  userType?: string,
  disclosureLevel?: number,
): string {
  if (!userType && !disclosureLevel) return '';

  const lines: string[] = ['## User Context'];

  switch (userType) {
    case 'builder':
      lines.push('The user is a Builder (Level 1). They think in workflows, not code.');
      lines.push('- Use simple language. No S-expressions, no guard syntax, no compiled output details.');
      lines.push('- Focus on what the app DOES, not how it works internally.');
      lines.push('- Emphasize render-ui results and deployment.');
      break;
    case 'designer':
      lines.push('The user is a Designer (Level 2). They edit UI directly.');
      lines.push('- Focus on patterns, layout, visual structure, and entity fields.');
      lines.push('- Mention pattern types and props by name. Avoid state machine internals.');
      lines.push('- When adding UI, describe what it looks like and where it appears.');
      break;
    case 'architect':
      lines.push('The user is an Architect (Level 3). They read .orb programs.');
      lines.push('- Be technical. Show guard expressions, effect chains, event wiring.');
      lines.push('- Report validation details, JEPA predictions, and circuit integrity.');
      lines.push('- Do not simplify or hide structural details.');
      break;
    case 'contributor':
      lines.push('The user is a Contributor. They compose behaviors, not apps.');
      lines.push('- Focus on behavior composition, event wiring, and registry publishing.');
      lines.push('- Mention behavior level (atom/molecule), domain, and connectable events.');
      break;
  }

  if (disclosureLevel) {
    lines.push(`\nDisclosure level: ${disclosureLevel}/4. Show detail appropriate to this level.`);
  }

  return lines.join('\n');
}
