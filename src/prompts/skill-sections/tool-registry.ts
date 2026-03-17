/**
 * Tool Registry Skill Section
 *
 * Derives tool names, descriptions, and categories from @almadar/tools
 * at build time and embeds them into the skill prompt.
 *
 * @packageDocumentation
 */

/**
 * Static tool registry data.
 * Maintained here instead of importing @almadar/tools to avoid
 * circular dependency (skills -> tools -> skills). Updated when
 * tools are added or descriptions change.
 */
const TOOL_REGISTRY: Array<{ name: string; category: string; description: string }> = [
  // Schema Lifecycle
  { name: 'validate_schema', category: 'schema', description: 'First thing to run after editing any .orb file. Must produce 0 errors AND 0 warnings before proceeding.' },
  { name: 'compile_schema', category: 'schema', description: 'Run after validate_schema passes. Generates a full-stack app from the .orb file. Follow with install_deps.' },
  { name: 'format_schema', category: 'schema', description: 'Clean up an .orb file before committing. Use --write to modify in place.' },
  { name: 'simulate_schema', category: 'schema', description: 'Use when you suspect dead states or missing render-ui coverage. BFS state walk.' },
  { name: 'parse_schema', category: 'schema', description: 'Use to understand an .orb file. Shows entities, traits, pages, counts. Read-only.' },
  { name: 'test_schema', category: 'schema', description: 'Run after compile_schema to verify state machine logic headlessly. Faster than verify_orbital.' },
  { name: 'dev_server', category: 'schema', description: 'Start live dev environment. Compiles, launches Vite + Express with hot-reload. Long-running.' },

  // Verification
  { name: 'verify_orbital', category: 'verify', description: 'The primary verification tool. 4 phases: static, compile, server, browser. Always --headed --screenshots.' },
  { name: 'verify_behaviors', category: 'verify', description: 'Run after editing any behavior. Loops orbital verify over all 103 std-*.orb exports.' },
  { name: 'storybook_verify', category: 'verify', description: 'Run after editing design system components. Verifies all Storybook stories render.' },
  { name: 'verify_runtime', category: 'verify', description: 'Connects to a live URL, discovers behaviors/modules, tests via Playwright. Needs running server.' },
  { name: 'verify_extraction', category: 'verify', description: 'Run after extracting a package to its own repo. Tests standalone + monorepo integration.' },
  { name: 'verify_parity', category: 'verify', description: 'Run when you suspect Rust compiler and TypeScript runtime produce different results.' },
  { name: 'builder_smoke_test', category: 'verify', description: 'Run after modifying apps/builder/. Checks regressions, event bus wiring, API endpoints.' },

  // Inspection
  { name: 'browser_console', category: 'inspect', description: 'Use after deploying or starting dev server. Captures all console output.' },
  { name: 'screenshot', category: 'inspect', description: 'Capture visual proof of a running app. PNG files for review.' },
  { name: 'gha_workflow_status', category: 'inspect', description: 'Check if a CI build or publish succeeded for any almadar-io repo.' },
  { name: 'gha_deploy_status', category: 'inspect', description: 'Check if a Firebase deployment is live.' },
  { name: 'list_projects', category: 'inspect', description: 'Discover what projects exist. Call before working on an unfamiliar project.' },
  { name: 'list_behaviors', category: 'inspect', description: 'Find reusable behaviors from the std library. Check before creating custom traits.' },
  { name: 'read_pattern_registry', category: 'inspect', description: 'Find valid pattern types and their props for render-ui effects. Never invent patterns.' },

  // Sync
  { name: 'pattern_sync', category: 'sync', description: 'MANDATORY after component changes. Step 1/3 of pattern pipeline.' },
  { name: 'sync_rust', category: 'sync', description: 'Step 2/3 of pattern pipeline. Copies JSON to Rust crates.' },
  { name: 'sync_all', category: 'sync', description: 'Master sync. Use when multiple targets are stale or after broad changes.' },
  { name: 'service_sync', category: 'sync', description: 'Run after adding/modifying ServiceContract types.' },
  { name: 'flatten_sync', category: 'sync', description: 'Run after adding components to a project design-system.' },
  { name: 'i18n_sync', category: 'sync', description: 'Run after modifying i18n locale definitions.' },
  { name: 'sync_orb_to_behaviors', category: 'sync', description: 'Reverse-sync when .orb was accidentally edited directly.' },
  { name: 'sync_builder_ds', category: 'sync', description: 'Run after editing projects/builder/design-system/.' },
  { name: 'behavior_registry_sync', category: 'sync', description: 'Run after export_behavior to update the behaviors index.' },

  // Build
  { name: 'build_compiler', category: 'build', description: 'Step 3/3 of pattern pipeline. Rebuilds compiler binary with latest pattern data.' },
  { name: 'export_behavior', category: 'build', description: 'Run after editing behavior .ts source. Converts to .orb format.' },
  { name: 'install_deps', category: 'build', description: 'Run after compile_schema on output directory. Required before dev_server or verify_orbital.' },
  { name: 'build_package', category: 'build', description: 'Run after modifying source in a packages/almadar-* directory.' },

  // Convert
  { name: 'convert_source', category: 'convert', description: 'Reverse-engineer existing codebase into .orb. Output needs manual refinement.' },

  // Scaffold
  { name: 'create_project', category: 'scaffold', description: 'Start a new project from scratch. Creates schema + design system scaffold.' },
  { name: 'migrate_standalone', category: 'scaffold', description: 'Extract project to standalone GitHub repo with Firebase. Irreversible.' },
  { name: 'architecture_generate', category: 'scaffold', description: 'Produce client-facing docs from .orb: C4 diagrams, proposals, specs.' },

  // Security
  { name: 'security_audit', category: 'security', description: 'Run before releases. Audits dependencies and code patterns.' },

  // Quality
  { name: 'lint_files', category: 'quality', description: 'MANDATORY before declaring done. Run on every file you touched. Zero tolerance.' },
];

/**
 * Full tool registry table for the codebase meta-skill.
 */
export function getToolRegistrySection(): string {
  const rows = TOOL_REGISTRY.map(t => `| \`${t.name}\` | ${t.category} | ${t.description} |`).join('\n');

  return `## Available Tools (${TOOL_REGISTRY.length} total)

| Tool | Category | When to Use |
|------|----------|-------------|
${rows}`;
}

/**
 * Tool registry filtered by category.
 */
export function getToolsByCategorySection(category: string): string {
  const tools = TOOL_REGISTRY.filter(t => t.category === category);
  const rows = tools.map(t => `| \`${t.name}\` | ${t.description} |`).join('\n');

  return `### ${category} Tools

| Tool | When to Use |
|------|-------------|
${rows}`;
}

/**
 * Schema lifecycle workflow section.
 */
export function getSchemaLifecycleSection(): string {
  return `## Schema Lifecycle

The correct order for working with .orb files:

\`\`\`
1. UNDERSTAND     parse_schema           Inspect structure before editing
2. DISCOVER       list_behaviors         Find reusable std behaviors
                  read_pattern_registry  Find valid patterns for render-ui
3. EDIT           (file editing)         Write or modify the .orb file
4. VALIDATE       validate_schema        Must produce 0 errors, 0 warnings
5. SIMULATE       simulate_schema        Check for dead states (if suspicious)
6. COMPILE        compile_schema         Generate app code
7. INSTALL        install_deps           Install dependencies in output dir
8. TEST           test_schema            Headless state machine verification
9. FORMAT         format_schema --write  Clean up before committing
\`\`\`

### Rules
- NEVER skip step 4. Compilation on invalid schemas wastes time.
- Step 5 is optional but recommended for complex schemas.
- Step 7 is required before verify_orbital or dev_server will work.
- Step 9 is courtesy, not mandatory, but keeps schemas readable.`;
}

/**
 * Pattern pipeline section (3-step component -> compiler flow).
 */
export function getPatternPipelineSection(): string {
  return `## Pattern Pipeline (3 Steps, ALL Required)

After adding, editing, or removing ANY component in @almadar/ui or a project design-system:

\`\`\`
Step 1:  pattern_sync          Regenerate patterns-registry.json from Props
Step 2:  sync_rust              Copy JSON to Rust compiler crates
Step 3:  build_compiler         Rebuild binary with new pattern data
\`\`\`

### Why all 3?
- Step 1 updates the JSON files.
- Step 2 copies them into the Rust crate source.
- Step 3 recompiles the binary. The pattern data is compiled INTO the binary.
- Skipping step 2+3 means the compiler still uses OLD patterns even though the JSON is new.
- This has caused real bugs: new components exported from npm but compiler stripped them during codegen.

### When to run
- Added a new component? Run all 3.
- Changed Props on an existing component? Run all 3.
- Renamed or deleted a component? Run all 3.
- Only changed component internals (no Props change)? Skip, no pipeline needed.`;
}

/**
 * Verification decision tree section.
 */
export function getVerificationSection(): string {
  return `## Verification Decision Tree

\`\`\`
What changed?                       Which tool?
──────────────────────────────────────────────────
.orb schema                         verify_orbital --headed --screenshots
                                    (THE primary tool, always use this)

Standard behavior (.ts)             verify_behaviors --headed --screenshots
                                    (loops all 103 behaviors)

Design system component             storybook_verify
                                    (Storybook visual check)

App is running, need console check  browser_console
                                    (capture errors/warnings)

Need visual proof                   screenshot
                                    (PNG output for review)

Suspect Rust/TS divergence          verify_parity
                                    (cross-implementation comparison)

Builder IDE changes                 builder_smoke_test
                                    (source checks + API smoke test)

ALL changes before declaring done   lint_files on EVERY file you touched
                                    (MANDATORY, zero tolerance)
\`\`\``;
}

/**
 * Project structure conventions section.
 */
export function getProjectStructureSection(): string {
  return `## Project Structure

\`\`\`
projects/{name}/                 Client projects
  {name}.orb                     Schema (source of truth)
  design-system/                 Project-specific components
  app/                           GENERATED (never edit directly)
    packages/client/             React frontend
    packages/server/             Express backend
    packages/shared/             Shared types

packages/almadar-*/              Shared packages (npm published)
  src/                           Source code (edit here)
  dist/                          Built output (auto-generated)

tools/                           Developer tools
orbital-rust/                    Rust compiler (ask before modifying)
docs/                            Architecture docs
\`\`\`

### Key Rules
- NEVER edit projects/*/app/ -- it's compiler output. Fix the .orb instead.
- NEVER edit orbital-rust/crates/ without user approval.
- Edit design system components in projects/{name}/design-system/, not in app/.
- Run pattern pipeline after any design system change.`;
}
