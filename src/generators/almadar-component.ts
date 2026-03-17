/**
 * almadar-component Skill Generator
 *
 * Teaches the full component -> pattern -> compiler pipeline.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
  getPatternPipelineSection,
  getToolsByCategorySection,
} from '../prompts/skill-sections/index.js';
import { getOrbRenderUIGuide } from '../prompts/skill-sections/orb-render-ui-guide.js';
import { getThemeGuide } from '../prompts/skill-sections/theme-guide.js';

export function generateAlmadarComponentSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'almadar-component',
    description: 'Component development: edit design system components, run the 3-step pattern pipeline, verify with Storybook.',
    allowedTools: [
      'pattern_sync', 'sync_rust', 'build_compiler', 'storybook_verify',
      'read_pattern_registry', 'build_package', 'lint_files',
    ],
    version: '1.0.0',
  };

  const content = `# Component Development Skill

> Teaches how to edit design system components and keep the compiler in sync.

${getPatternPipelineSection()}

---

${getToolsByCategorySection('sync')}

---

${getOrbRenderUIGuide()}

---

${getThemeGuide()}

---

## Component Editing Workflow

\`\`\`
1. EDIT         Edit component in @almadar/ui or projects/{name}/design-system/
2. LINT         lint_files on the changed file
3. BUILD        build_package for the affected package (e.g., "ui")
4. PIPELINE 1   pattern_sync (--core-only or --project <name>)
5. PIPELINE 2   sync_rust
6. PIPELINE 3   build_compiler
7. VERIFY       storybook_verify to check stories render
8. CHECK        read_pattern_registry to confirm changes appear
\`\`\`

## Component Rules

- NEVER use raw HTML (\`<div>\`, \`<span>\`, \`<button>\`, etc.)
- Use @almadar/ui components: VStack, HStack, Box, Typography, Button, etc.
- Every component must support: className, isLoading, error, entity props
- Molecules accept normal typed props. NO entity prop.
- Organisms accept \`entity\` as primary data prop via EntityDisplayProps<T>.
- Every new component MUST have a .stories.tsx file.
`;

  return { name: 'almadar-component', frontmatter, content };
}
