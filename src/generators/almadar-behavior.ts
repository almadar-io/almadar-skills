/**
 * almadar-behavior Skill Generator
 *
 * Teaches how to edit, export, and verify standard behaviors.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
  getArchitectureSection,
  getToolsByCategorySection,
} from '../prompts/skill-sections/index.js';

export function generateAlmadarBehaviorSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'almadar-behavior',
    description: 'Behavior development: edit .ts source, export to .orb, update registry, verify all behaviors.',
    allowedTools: [
      'export_behavior', 'behavior_registry_sync', 'verify_behaviors',
      'list_behaviors', 'sync_orb_to_behaviors', 'validate_schema', 'lint_files',
    ],
    version: '1.0.0',
  };

  const content = `# Behavior Development Skill

> Teaches how to edit, export, and verify standard behaviors in packages/almadar-std/.

${getArchitectureSection()}

---

${getToolsByCategorySection('build')}

---

## Behavior Editing Flow

\`\`\`
1. Edit the .lolo source under packages/almadar-std/behaviors/lolo/ (or
   packages/almadar-behaviors/behaviors/lolo/). The packages are live: orb and
   every TS reader lower the .lolo on read, so there is no emit step.
2. Run \`orb validate <file.lolo>\` until it reports 0 errors and 0 warnings.
3. Probe the changed transition (play_transition / orb evaluate) with a paired control.
4. Run lint_files on all changed files.
\`\`\`

---

## Behavior Quality Rules

Every behavior in packages/almadar-std/behaviors/ must:

1. Have UX that mirrors a real-world production app. No shortcuts, no placeholder UIs.
2. Use molecule-first composition (atoms + molecules, no organisms).
3. The behavior name defines the contract: "location-picker" must actually pick locations.
4. Pass orbital validate with 0 errors AND 0 warnings.
5. Every render-ui effect must use valid patterns from read_pattern_registry.

---

## list_behaviors

Call list_behaviors before creating a new behavior to check:
- Does a similar behavior already exist?
- Can you extend an existing one instead of creating new?
- What level (atom/molecule/organism) should this be?
`;

  return { name: 'almadar-behavior', frontmatter, content };
}
