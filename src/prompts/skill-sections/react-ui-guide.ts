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
    output += '```tsx\nimport { Stack, Typography, Button, Badge, Icon, Divider, DataGrid, DataList, StatDisplay, Card, Avatar, ProgressBar, Alert, Modal } from "@almadar/ui";\n```\n\n';

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

You must write a typed React function component. The converter transforms it to render-ui JSON.

### Required structure
\`\`\`tsx
import { Stack, Typography, DataGrid, Card, Badge, Button } from '@almadar/ui';

interface Task {
  id: string;
  title: string;
  status: string;
}

export function TaskListView({ entity }: { entity: Task[] }) {
  return (
    <Stack direction="vertical" gap="xl">
      <Typography variant="h1" content="Tasks" />
      <DataGrid entity={entity} renderItem={(item: Task) => (
        <Card title={item.title}>
          <Badge label={item.status} />
        </Card>
      )} />
    </Stack>
  );
}
\`\`\`

### REQUIRED
- \`import { ... } from '@almadar/ui'\` (components you use)
- \`interface EntityName { ... }\` (typed from entity fields)
- \`export function ViewName({ entity }: { entity: EntityName[] })\`
- \`return (...)\` wrapping JSX
- Access entity data as typed props: \`entity.title\`, \`item.status\`
- The converter automatically rewrites \`entity.title\` to \`@entity.title\` bindings

### ALLOWED
- String literal props: \`label="Tasks"\`
- Typed property access: \`content={entity.title}\`, \`label={item.status}\`
- Array literal props: \`fields={["title", "status"]}\`
- Object literal props: \`itemActions={[{ event: "EDIT", label: "Edit" }]}\`
- renderItem arrow function: \`renderItem={(item: Task) => (...)}\`
- Component nesting: \`<Stack><Typography /><Button /></Stack>\`

### BANNED (will fail lint)
- **No hooks**: useState, useEffect, useMemo, useCallback
- **No callbacks**: onClick={() => ...}, onChange={handleChange} (except renderItem)
- **No local variables**: const x = ... (access entity fields directly)
- **No raw HTML**: <div>, <span>, <p>, <section> (use Stack, Box, Typography)
- **No .map()/.filter()**: DataGrid/DataList handle iteration via renderItem
- **No @entity.field magic strings**: use typed prop access instead
- **No template literals**: \`\`\${entity.name}\`\`
- **No computed expressions**: count={array.length}

### DataGrid / DataList with renderItem
\`\`\`tsx
<DataGrid entity={entity} renderItem={(item: Task) => (
  <Stack direction="horizontal" gap="md">
    <Typography variant="h4" content={item.title} />
    <Badge label={item.status} variant="primary" />
    <Button label="Edit" event="EDIT" variant="ghost" />
  </Stack>
)} />
\`\`\`
Inside renderItem, access fields on the typed \`item\` parameter.
Outside renderItem, access fields on the \`entity\` prop.

### Events
Use event prop strings, not callbacks:
\`\`\`tsx
<Button label="Create" event="CREATE" variant="primary" />
\`\`\`

### Props
Typography uses \`content\` (NOT \`text\`). Badge uses \`label\` (NOT \`text\`).`;
}

/**
 * Entity binding reference for React JSX context.
 */
export function getReactEntityBindings(): string {
    return `## Entity Data Access

Access entity data through typed props. The converter rewrites to binding strings automatically.

| In your JSX | Converter produces |
|-------------|-------------------|
| \`entity.title\` | \`@entity.title\` |
| \`item.status\` (inside renderItem) | \`@item.status\` |

\`\`\`tsx
// You write:
<Typography content={entity.title} />
<Badge label={item.status} />

// Converter produces render-ui JSON:
// { type: "typography", content: "@entity.title" }
// { type: "badge", label: "@item.status" }
\`\`\`

Do NOT use magic strings like \`"@entity.title"\`. Use typed property access.
One field per prop value. No concatenation, no function calls.`;
}
