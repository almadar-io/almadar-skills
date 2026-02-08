/**
 * Uses Import System Section
 *
 * Guidance for using the `uses` declaration to import external orbitals.
 *
 * @packageDocumentation
 */

/**
 * Get the uses import system section.
 */
export function getUsesImportSection(): string {
    return `## Orbital Import System (\`uses\`)

Orbitals can import other orbitals to reuse their components.

### Basic Usage

\`\`\`json
{
  "name": "Level1",
  "uses": [
    { "from": "./goblin.orb", "as": "Goblin" },
    { "from": "./health.orb", "as": "Health" }
  ],
  "entity": "Goblin.entity",
  "traits": [
    "Goblin.traits.Movement",
    "Health.traits.Health"
  ],
  "pages": []
}
\`\`\`

### Component References

After importing with \`uses\`, access components via:

| Component | Reference Format | Example |
|-----------|------------------|---------|
| Entity | \`Alias.entity\` | \`"entity": "Goblin.entity"\` |
| Trait | \`Alias.traits.TraitName\` | \`"traits": ["Health.traits.Health"]\` |
| Page | \`Alias.pages.PageName\` | \`"pages": ["User.pages.Profile"]\` |

### Page Path Override

When importing a page, you can override its URL path:

\`\`\`json
{
  "pages": [
    { "ref": "User.pages.Profile", "path": "/my-profile" }
  ]
}
\`\`\`

### Entity Persistence Semantics

When you reference an imported entity, the behavior depends on its persistence type:

| Persistence | Sharing Behavior | Use Case |
|-------------|------------------|----------|
| \`persistent\` | **Shared** - Same DB collection | Users, Products, Orders |
| \`runtime\` | **Isolated** - Each orbital gets own instances | Game entities, UI state |
| \`singleton\` | **Shared** - Single global instance | Config, Game state |

**Example**: Two orbitals importing a \`runtime\` entity each get separate instances:
\`\`\`json
// level1.orb
{ "entity": "Goblin.entity" }  // Level1's goblins

// level2.orb
{ "entity": "Goblin.entity" }  // Level2's goblins (separate!)
\`\`\`

### Import Sources

| Source Format | Description |
|---------------|-------------|
| \`"./path.orb"\` | Local relative path |
| \`"../shared/health.orb"\` | Parent directory |
| \`"std/behaviors/game-core"\` | Standard library |
| \`"@game-lib/enemies.orb"\` | Scoped package |

### Key Rules

1. **Alias must be PascalCase** - e.g., \`"as": "Health"\`, NOT \`"as": "health"\`
2. **All traits belong in orbitals** - No schema-level \`traits[]\` array
3. **References must match imports** - \`Goblin.entity\` requires \`{ "as": "Goblin" }\` in \`uses\`
4. **Inline OR reference** - Each component slot accepts either form
`;
}

/**
 * Get compact uses guidance.
 */
export function getUsesImportCompact(): string {
    return `## Orbital Imports (\`uses\`)

Import other orbitals and reference their components:

\`\`\`json
{
  "uses": [{ "from": "./health.orb", "as": "Health" }],
  "entity": "Health.entity",           // Reference entity
  "traits": ["Health.traits.Health"],  // Reference trait
  "pages": ["Health.pages.Dashboard"]  // Reference page
}
\`\`\`

**Alias must be PascalCase.** No schema-level \`traits[]\` array exists.
`;
}
