/**
 * React UI Guide Skill Sections
 *
 * For the React flattening generation path. Shows @almadar/ui components
 * as React JSX (what LLMs know) instead of pattern JSON (what they don't).
 * Atoms + molecules only. No organisms, no templates.
 *
 * Data pulled dynamically from @almadar/patterns.
 *
 * @packageDocumentation
 */

import { getOrbAllowedPatterns, COMPONENT_MAPPING, isValidPatternType } from '@almadar/patterns';

interface MappingEntry { component: string; importPath: string; category: string }

/**
 * Build the reverse mapping: component name → pattern name.
 * Uses COMPONENT_MAPPING from @almadar/patterns (imported at module level).
 */
function getComponentMapping(): Record<string, { pattern: string } & MappingEntry> {
    const result: Record<string, { pattern: string } & MappingEntry> = {};
    const mappings = (COMPONENT_MAPPING as { mappings?: Record<string, MappingEntry> })?.mappings;
    if (!mappings) return result;
    for (const [pattern, entry] of Object.entries(mappings)) {
        if (entry.component) {
            result[entry.component] = { pattern, ...entry };
        }
    }
    return result;
}

/**
 * React component reference for atoms + molecules.
 * Shows components as JSX with their props from the pattern registry.
 */
export function getReactComponentReference(): string {
    const groups = getOrbAllowedPatterns() as Record<string, Array<{ name: string; keyProps?: string[]; description?: string }>>;
    const componentMap = getComponentMapping();

    // Build reverse: pattern name → component name
    const patternToComponent: Record<string, string> = {};
    for (const [comp, entry] of Object.entries(componentMap)) {
        patternToComponent[entry.pattern] = comp;
        // Filter to atoms/molecules only
    }

    let output = '## React Components (@almadar/ui)\n\n';
    output += 'Use these components in your JSX. Atoms and molecules only.\n\n';
    output += '```tsx\nimport { Stack, Typography, Button, Badge, Icon, Divider, DataGrid, FormSection, StatDisplay } from "@almadar/ui";\n```\n\n';

    for (const [category, patterns] of Object.entries(groups)) {
        const rows: string[] = [];
        for (const p of patterns) {
            const comp = patternToComponent[p.name];
            if (!comp) continue;
            // Check if atom or molecule by import path
            const mapping = componentMap[comp];
            if (!mapping) continue;
            const isAtomOrMolecule = mapping.importPath.includes('/atoms/') || mapping.importPath.includes('/molecules/');
            if (!isAtomOrMolecule) continue;
            // Only include patterns the validator actually accepts
            if (!isValidPatternType(p.name)) continue;

            const props = (p.keyProps ?? []).slice(0, 5).join(', ');
            rows.push(`| \`<${comp} />\` | ${p.name} | ${props} |`);
        }
        if (rows.length === 0) continue;
        output += `### ${category}\n`;
        output += '| JSX | Pattern | Key Props |\n|-----|---------|----------|\n';
        output += rows.join('\n') + '\n\n';
    }

    // Add convenience wrappers not in registry
    output += '### Layout Shortcuts\n';
    output += '| JSX | Maps to | Notes |\n|-----|---------|-------|\n';
    output += '| `<VStack>` | stack (vertical) | Shorthand for `<Stack direction="vertical">` |\n';
    output += '| `<HStack>` | stack (horizontal) | Shorthand for `<Stack direction="horizontal">` |\n';
    output += '\n';

    return output;
}

/**
 * Template compliance rules for the React subagent.
 * What survives the JSX → JSON → compiled JSX round-trip.
 */
export function getTemplateComplianceRules(): string {
    return `## Template Compliance Rules

Your JSX must survive the flattener round-trip: JSX → JSON → compiled JSX.

### ALLOWED
- String literal props: \`label="Tasks"\`
- Entity bindings as strings: \`text="@entity.title"\`, \`value="@entity.count"\`
- Array literal props: \`fields={["title", "status"]}\`
- Object literal props: \`itemActions={[{ event: "EDIT", label: "Edit" }]}\`
- Simple conditionals: \`variant={entity.active ? "success" : "neutral"}\`
- Component nesting: \`<Stack><Typography /><Button /></Stack>\`

### BANNED (will be stripped or break)
- **No hooks**: useState, useEffect, useMemo, useCallback, useRef — all banned
- **No callbacks**: onClick={() => ...}, onChange={handleChange} — use event/submitEvent props instead
- **No local variables**: const x = ..., let y = ... — access entity fields directly
- **No imports**: import { helper } from ... — everything must be inline
- **No .map()/.filter()**: data-grid and data-list handle iteration internally
- **No template literals with expressions**: \`\`\${entity.name}\`\` — use "@entity.name" string
- **No computed expressions**: count={array.length}, value={a + b}
- **No JSX in props**: icon={<Icon />} — use icon="iconName" string

### Entity Bindings
Use "@entity.fieldName" as string prop values:
\`\`\`tsx
<Typography variant="h1" content="@entity.title" />
<Badge label="@entity.status" variant="primary" />
<StatDisplay value="@entity.count" label="Total" />
\`\`\`
Note: Typography uses \`content\` prop (NOT \`text\`). Badge uses \`label\` prop (NOT \`text\`).

### DataGrid / DataList — MUST use renderItem
DataGrid and DataList require \`renderItem\` render prop for per-item views. Do NOT nest children directly.
\`\`\`tsx
// CORRECT: renderItem render prop
<DataGrid entity="Task" renderItem={(item) => (
  <Stack direction="horizontal" gap="md">
    <Typography variant="h4" content="@item.title" />
    <Badge label="@item.status" variant="primary" />
    <Button label="Edit" event="EDIT_TASK" variant="ghost" />
  </Stack>
)} />

// WRONG: nesting children — will not compile correctly
<DataGrid entity="Task">
  <Stack>...</Stack>
</DataGrid>
\`\`\`
Inside renderItem, use \`@item.fieldName\` bindings (not \`@entity.fieldName\`).

### Events
Use event prop strings, not callbacks:
\`\`\`tsx
<Button label="Create" event="CREATE" variant="primary" />
<FormSection entity="Task" fields={["title"]} submitEvent="SAVE" cancelEvent="CANCEL" />
<DataGrid entity="Task" itemActions={[{ event: "EDIT", label: "Edit" }]} />
\`\`\``;
}

/**
 * Entity binding reference for React JSX context.
 */
export function getReactEntityBindings(): string {
    return `## Entity Bindings in JSX

All data access uses "@root.path" strings as prop values:

| Binding | JSX Usage |
|---------|-----------|
| @entity.field | \`<Typography text="@entity.title" />\` |
| @payload.field | \`<Typography text="@payload.data" />\` (read-only, in event handlers) |
| @state | \`<Badge text="@state" />\` (current state name, bare) |
| @now | \`<Typography text="@now" />\` (timestamp) |

No function calls: @count(), @sum(), @filter() do NOT exist.
No concatenation: "@entity.first @entity.last" is INVALID.
One binding per prop value.`;
}
