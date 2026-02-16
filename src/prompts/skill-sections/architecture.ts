/**
 * Skill Architecture Section
 *
 * Core orbital architecture concepts - minimal, essential information only.
 *
 * @packageDocumentation
 */

/**
 * Get the core orbital architecture section.
 * This is the foundational understanding needed for orbital generation.
 */
export function getArchitectureSection(): string {
  return `## Orbital Architecture

### Schema Format (IMPORTANT)

The correct schema format uses **orbitals** array at root:

\`\`\`json
{
  "name": "MyApp",
  "version": "1.0.0",
  "orbitals": [           // ← CORRECT: orbitals array
    {
      "name": "Task Management",
      "entity": { ... },
      "traits": [ ... ],
      "pages": [ ... ]
    }
  ]
}
\`\`\`

**DO NOT** confuse with legacy format that had \`dataEntities\`, \`traits\`, \`pages\` at root level.
The \`orbitals[]\` format IS the standard format - do not "fix" it to something else.

**NOTE**: There is NO schema-level \`traits[]\` array. All traits belong inside orbitals.

### Core Formula
\`\`\`
Orbital Unit = Entity × Traits × Patterns
Application  = Σ(Orbital Units)
\`\`\`

### The Closed Circuit Pattern
\`\`\`
Trait State Machine → render-ui → UI Component → User Action → Event → Trait
        ↑                                                           |
        └───────────────────────────────────────────────────────────┘
\`\`\`

1. **Trait** transitions to state, fires \`render-ui\` effect
2. **UI Component** renders with actions (buttons, forms)
3. **User clicks** → Component emits event (e.g., \`UI:CREATE\`)
4. **Trait receives** event, transitions, cycle repeats

### Key Principles

| Principle | Rule |
|-----------|------|
| **One trait per slot** | Each slot (main, modal, drawer) owned by ONE trait |
| **INIT renders UI** | Every trait needs INIT self-loop to render initial UI |
| **One page per entity** | Use trait's render-ui for create/edit/view, not separate pages |
| **form-section has submitEvent** | Connects form to trait events (NOT onSubmit!) |
| **std/* are templates** | Guide LLM generation, not runtime code |

### Slot Ownership
\`\`\`
┌─────────────────────────────────────────────┐
│ Page: /tasks                                │
├─────────────────────────────────────────────┤
│ TaskManagement trait OWNS:                  │
│   • main → entity-table, page-header        │
│   • modal → form-section (create/edit)      │
│   • drawer → detail-panel (view)            │
│                                             │
│ NO other trait should render to these slots │
└─────────────────────────────────────────────┘
\`\`\`
`;
}
