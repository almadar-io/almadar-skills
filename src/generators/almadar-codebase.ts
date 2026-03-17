/**
 * almadar-codebase Skill Generator
 *
 * Meta-skill combining all tool knowledge for full codebase autonomy.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
  getToolRegistrySection,
  getSchemaLifecycleSection,
  getPatternPipelineSection,
  getVerificationSection,
  getProjectStructureSection,
} from '../prompts/skill-sections/index.js';

export function generateAlmadarCodebaseSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'almadar-codebase',
    description: 'Full codebase autonomy: all 40 tools across schema lifecycle, verification, sync, build, scaffolding, and inspection.',
    allowedTools: [
      // Schema
      'validate_schema', 'compile_schema', 'format_schema', 'simulate_schema',
      'parse_schema', 'test_schema', 'dev_server',
      // Verify
      'verify_orbital', 'verify_behaviors', 'storybook_verify', 'verify_runtime',
      'verify_extraction', 'verify_parity', 'builder_smoke_test',
      // Inspect
      'browser_console', 'screenshot', 'gha_workflow_status', 'gha_deploy_status',
      'list_projects', 'list_behaviors', 'read_pattern_registry',
      // Sync
      'pattern_sync', 'sync_rust', 'sync_all', 'service_sync', 'flatten_sync',
      'i18n_sync', 'sync_orb_to_behaviors', 'sync_builder_ds', 'behavior_registry_sync',
      // Build
      'build_compiler', 'export_behavior', 'install_deps', 'build_package',
      // Convert
      'convert_source',
      // Scaffold
      'create_project', 'migrate_standalone', 'architecture_generate',
      // Security + Quality
      'security_audit', 'lint_files',
    ],
    version: '1.0.0',
  };

  const content = `# Almadar Codebase Skill (Full Autonomy)

> Complete tool knowledge for managing the entire Almadar codebase.
> This is the meta-skill. Load it when you need to do anything and everything.

${getToolRegistrySection()}

---

${getProjectStructureSection()}

---

## Task Decision Matrix

\`\`\`
I need to...                           Use these tools
───────────────────────────────────────────────────────────────
Write/edit an .orb schema              validate_schema, compile_schema, test_schema
Prove the app works                    verify_orbital (--headed --screenshots)
Edit a UI component                    pattern_sync -> sync_rust -> build_compiler
Edit a standard behavior               export_behavior -> behavior_registry_sync
Create a new project                   create_project
Check CI/deploy status                 gha_workflow_status, gha_deploy_status
Find patterns for render-ui            read_pattern_registry
Find reusable behaviors                list_behaviors
Reverse-engineer existing code         convert_source
Audit security before release          security_audit
\`\`\`

---

${getSchemaLifecycleSection()}

---

${getPatternPipelineSection()}

---

${getVerificationSection()}

---

## Hard Rules (Zero Tolerance)

1. **validate_schema BEFORE compile_schema.** Always.
2. **lint_files BEFORE declaring done.** On every file you touched.
3. **Pattern pipeline is 3 steps.** Never skip steps 2+3.
4. **verify_orbital with --headed --screenshots.** Always.
5. **0 errors AND 0 warnings.** Warnings are errors.
6. **NEVER edit projects/*/app/.** It's compiler output. Fix the .orb.
7. **NEVER edit orbital-rust/crates/** without user approval.
8. **NEVER edit .orb files in behaviors/exports/.** Edit the .ts source.
`;

  return { name: 'almadar-codebase', frontmatter, content };
}
