/**
 * Domain Language Skill Generator
 *
 * Generates the domain-language skill for understanding, generating,
 * and summarizing KFlow domain language.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';

// Inline domain language constants (TODO: move to separate domain-language package)
const ODL_SYNTAX_REFERENCE = `
## Domain Language Syntax

Entity: \`A [Name] is a [persistent] entity that: - has [field] as [type]\`
Page: \`[PageName] at /[path]: - shows [Entity] using [Behavior]\`
`;

const ODL_EXAMPLES = `
## Examples

\`\`\`
A Task is a persistent entity that:
  - has title as text (required)
  - has status as enum [pending, active, done]

TasksPage at /tasks:
  - shows Task using List behavior
\`\`\`
`;

const ODL_PATTERNS = `
## Patterns

Use patterns like entity-table, form-section in domain language.
`;

const ODL_TO_SCHEMA_MAPPING = `
## Mapping

Domain language converts to OrbitalSchema JSON via compiler.
`;

/**
 * Generate the domain-language skill.
 */
export function generateDomainLanguageSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'domain-language',
    description: 'Understand, generate, and summarize KFlow domain language. Convert natural language requirements to domain language and provide human-readable summaries.',
    allowedTools: ['Read', 'Write', 'Edit'],
    version: '1.0.0',
  };

  const content = `
# KFlow Domain Language Skill

This skill enables you to understand, generate, and summarize KFlow domain language - a human-readable format for defining application schemas.

## What is Domain Language?

Domain language is a structured text format that represents KFlow schemas in a readable way:
- **Entities** - Data models with fields and relationships
- **Pages** - UI views with patterns and traits
- **Behaviors** - State machines and workflows

## Capabilities

### 1. Generate Domain Language from Requirements

Convert natural language requirements into domain language text.

### 2. Summarize Domain Language

Create human-readable summaries of existing domain language definitions.

### 3. Edit Domain Language

Make targeted edits to existing domain language text.

## Domain Language Syntax Reference

${ODL_SYNTAX_REFERENCE}

## Patterns Reference

${ODL_PATTERNS}

## Full Examples

${ODL_EXAMPLES}

## Mapping to Schema

${ODL_TO_SCHEMA_MAPPING}

## Generation Workflow

### Step 1: Analyze Requirements

Extract key concepts:
- **Entities** - What data objects are needed?
- **Fields** - What properties does each entity have?
- **Pages** - What views are required?
- **Behaviors** - What workflows or state machines are needed?

### Step 2: Generate Domain Language

Use the syntax reference to create valid domain language:

\`\`\`
ENTITY TaskEntity:
  - title: string (required)
  - description: text
  - status: enum [pending, in_progress, done]
  - dueDate: date
  - assignee: relation -> User

PAGE TaskListPage:
  path: /tasks
  entity: Task
  viewType: list
  sections:
    - header (page-header): title="Tasks"
    - taskList (entity-list): entity="Task", presentation="table"
  traits: []

PAGE TaskCreateForm:
  path: /tasks/new
  entity: Task
  viewType: create
  sections:
    - header (page-header): title="Create Task"
    - form (form-section): entity="Task", layout="vertical"
    - actions (form-actions): submitLabel="Create Task"
  traits: [FormSubmission, FormValidation]
\`\`\`

### Step 3: Validate Structure

Ensure:
1. All entities have required fields
2. Pages reference valid entities
3. Traits are from the library or properly defined
4. Section patterns are valid

## Summarization Workflow

### Step 1: Parse Domain Language

Identify:
- Number of entities and their purposes
- Number of pages and their types
- Key behaviors and workflows

### Step 2: Generate Summary

Create a concise summary:

**Format:**
\`\`\`
**{App Name}** - {one-line description}

**Entities:**
- {Entity1} - {brief description}
- {Entity2} - {brief description}

**Pages:**
- {Page1} ({viewType}) - {purpose}
- {Page2} ({viewType}) - {purpose}

**Features:**
- {Key behavior 1}
- {Key behavior 2}
\`\`\`

### Summary Requirements

1. Keep it concise (200 words max)
2. Focus on business functionality
3. Use bullet points for clarity
4. Include entity count and page count
5. Highlight key workflows

## Output Format

### For Generation

Output ONLY the domain language text - no explanations or commentary.

### For Summary

Output a structured summary following the format above.

### For Edits

Output the complete updated domain language text.

## Best Practices

1. **Use library traits** - Prefer existing traits over custom behaviors
2. **Follow naming conventions** - PascalCase for entities/pages, camelCase for fields
3. **Include all required fields** - Every entity needs at least one field
4. **Define page paths** - Use RESTful URL patterns
5. **Match patterns to view types** - list→entity-list, detail→entity-detail, create/edit→form-section
`.trim();

  return {
    name: 'domain-language',
    frontmatter,
    content,
  };
}
