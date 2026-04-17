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
1. Edit the .orb file directly in packages/almadar-std/behaviors/registry/
   (registry/ is the canonical source of truth since Phase E, 2026-04-08).
   The .ts factories under behaviors/functions/ are @deprecated.
   The legacy behaviors/exports/ mirror is retired — do not edit there.
2. (Optional) If you must regenerate the .orb from the deprecated .ts
   factory, run export_behavior; prefer editing the .orb directly.
3. Run behavior_registry_sync to update the behaviors-registry.json index.
4. Run verify_behaviors --headed --screenshots (or ./tools/orbital-verify.sh
   with no args, which now defaults to scanning the full registry headed
   with screenshots).
5. Run lint_files on all changed files.
\`\`\`

### If a registry .orb needs to be fed back to the legacy .ts factory
Run sync_orb_to_behaviors. This reverse direction is rarely needed because
the .ts layer is @deprecated.

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
