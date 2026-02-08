/**
 * Context Usage Section
 *
 * Guidance for using embedded context when generating orbitals.
 * Small, reusable section for skill generators.
 *
 * @packageDocumentation
 */

/**
 * Get guidance for using embedded context during generation.
 */
export function getContextUsageSection(): string {
    return `## Using Embedded Context

When generating, read context from the orbital:

| Context Field | Usage |
|---------------|-------|
| \`domainContext.requestFragment\` | Understand what user asked for |
| \`domainContext.category\` | Influences pattern selection |
| \`domainContext.vocabulary\` | Use for button labels, titles, messages |
| \`design.style\` | Influences visual density and components |
| \`design.uxHints.flowPattern\` | Determines overall navigation structure |
| \`design.uxHints.listPattern\` | Use for entity display (table/cards/list) |
| \`design.uxHints.formPattern\` | Use for create/edit (modal/drawer/page) |
| \`design.uxHints.detailPattern\` | Use for detail view (drawer/page/split) |
| \`design.uxHints.relatedLinks\` | Add navigation to related orbitals |

**Example usage in generation:**
\`\`\`
If domainContext.vocabulary.create = "Recruit"
  → Button label: "Recruit" instead of "Create"

If design.uxHints.listPattern = "entity-cards"
  → Use entity-cards pattern instead of entity-table

If design.uxHints.formPattern = "drawer"
  → Render create/edit forms in drawer slot
\`\`\`
`;
}

/**
 * Get compact context usage for space-constrained prompts.
 */
export function getContextUsageCompact(): string {
    return `## Context Usage
- \`domainContext.vocabulary\` → labels (item, create, delete)
- \`design.uxHints.listPattern\` → entity-table | entity-cards | entity-list
- \`design.uxHints.formPattern\` → modal | drawer | page
- \`design.uxHints.relatedLinks\` → navigation to related orbitals
`;
}
