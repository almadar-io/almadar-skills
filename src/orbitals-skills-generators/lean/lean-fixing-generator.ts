/**
 * Lean Fixing Skill Generator
 *
 * Generates kflow-lean-fixing SKILL.md for fixing validation errors
 * using Domain Language format.
 *
 * @packageDocumentation
 */

// Inline lean prompts
const LEAN_CORE_INSTRUCTIONS = `
## Core Instructions

Fix validation errors by outputting corrected Domain Language text.
`;

const LEAN_ERROR_HANDLING = `
## Error Handling

1. Read the error message carefully
2. Locate the problematic section
3. Output corrected domain language
`;

const LEAN_VALIDATION_RULES = `
## Validation Rules

- Required fields must be marked
- Entity references must be valid
- Page paths must be unique
- Behaviors must be from std library
`;

const ODL_SYNTAX_REFERENCE = `
## Domain Language Syntax

See kflow-lean-orbitals skill for full syntax reference.
`;

const LEAN_EFFECT_GUARD_SYNTAX = `
## S-Expressions

Use S-expressions in domain language for guards and effects.
`;

const ODL_TO_SCHEMA_MAPPING = `
## Schema Mapping

Domain language maps to OrbitalSchema JSON structure.
`;

/**
 * Generate the kflow-lean-fixing SKILL.md content
 */
export function generateLeanFixingSkill(): string {
    return `---
name: kflow-lean-fixing
description: Fix OrbitalSchema validation errors using Domain Language format.
allowed-tools: Read, Write, Edit
version: 1.0.0
---

# kflow-lean-fixing

> Fix OrbitalSchema validation errors using Domain Language
>
> **Input**: Validation errors + current ODL
> **Output**: Fixed Domain Language sections

---

${LEAN_CORE_INSTRUCTIONS}

---

## Error Fixing Protocol

1. **Parse error code** - Identify the error type (ORB_E_*, ORB_T_*, etc.)
2. **Locate section** - Find the corresponding ODL section
3. **Apply fix** - Correct the issue in ODL format
4. **Output fixed section only** - Don't re-output unchanged sections

---

${LEAN_ERROR_HANDLING}

---

## Common Fixes

### ORB_E_MISSING_NAME
**Error**: Entity missing name
**Fix**: Ensure entity definition starts with "A [Name] is..."

Before:
\`\`\`
is a persistent entity that:
  - has title as text
\`\`\`

After:
\`\`\`
A Task is a persistent entity that:
  - has title as text
\`\`\`

### ORB_E_NO_FIELDS
**Error**: Entity has no fields
**Fix**: Add at least one field definition

Before:
\`\`\`
A Task is a persistent entity that:
\`\`\`

After:
\`\`\`
A Task is a persistent entity that:
  - has title as text (required)
\`\`\`

### ORB_T_NO_INITIAL_STATE
**Error**: Behavior has no initial state
**Fix**: Add "Initial: [StateName]" line

Before:
\`\`\`
TaskManager behavior:
  States: Viewing, Editing

  Transitions:
    ...
\`\`\`

After:
\`\`\`
TaskManager behavior:
  States: Viewing, Editing
  Initial: Viewing

  Transitions:
    ...
\`\`\`

### ORB_T_INVALID_TRANSITION
**Error**: Transition references non-existent state
**Fix**: Ensure From/To states exist in States list

Before:
\`\`\`
TaskManager behavior:
  States: Viewing, Editing
  Initial: Viewing

  Transitions:
    - From Viewing to Creating on CREATE  # 'Creating' not in States
\`\`\`

After:
\`\`\`
TaskManager behavior:
  States: Viewing, Editing, Creating  # Added Creating
  Initial: Viewing

  Transitions:
    - From Viewing to Creating on CREATE
\`\`\`

### ORB_P_NO_PATH
**Error**: Page has no path
**Fix**: Add "at /[path]" to page definition

Before:
\`\`\`
TasksPage:
  - shows Task using TaskManager
\`\`\`

After:
\`\`\`
TasksPage at /tasks:
  - shows Task using TaskManager
\`\`\`

### ORB_E_INVALID_RELATION
**Error**: Relation references non-existent entity
**Fix**: Ensure target entity is defined

Before:
\`\`\`
A Task is a persistent entity that:
  - belongs to Project  # Project not defined
\`\`\`

After (add missing entity):
\`\`\`
A Project is a persistent entity that:
  - has name as text (required)

A Task is a persistent entity that:
  - belongs to Project
\`\`\`

---

${ODL_SYNTAX_REFERENCE}

---

${LEAN_EFFECT_GUARD_SYNTAX}

---

${LEAN_VALIDATION_RULES}

---

${ODL_TO_SCHEMA_MAPPING}

---

## Output Format

**IMPORTANT**: Always write your fixes to \`domain.txt\` using the Write or Edit tool.

1. If \`domain.txt\` exists, use the Edit tool to modify it
2. If it doesn't exist, use the Write tool to create it
3. The file must contain the COMPLETE domain language with your fixes applied
4. Do NOT just output text to the chat - you must write to the file

When fixing errors:
- Read the existing domain.txt (if present)
- Apply fixes to the affected sections
- Write the complete fixed content to domain.txt
- Confirm the changes were applied

Example workflow:
1. Read domain.txt to understand current structure
2. Edit the specific section that has errors
3. Verify the fix by reading the file again
`;
}

/**
 * Get the skill metadata
 */
export function getLeanFixingSkillMetadata() {
    return {
        name: 'kflow-lean-fixing',
        description: 'Fix OrbitalSchema validation errors using Domain Language',
        category: 'orbital',
        priority: 'high',
        outputFormat: 'domain-language',
    };
}
