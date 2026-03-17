/**
 * almadar-schema Skill Generator
 *
 * Teaches an agent the full edit-validate-compile-test-run loop
 * for .orb schema development.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
  getArchitectureSection,
  getCommonErrorsSection,
  getSchemaLifecycleSection,
  getToolsByCategorySection,
  getBindingsGuide,
} from '../prompts/skill-sections/index.js';
import { getSExprQuickRef } from '../orbitals-skills-generators/helpers.js';

export function generateAlmadarSchemaSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'almadar-schema',
    description: 'Schema lifecycle: validate, compile, test, format, and run .orb files using @almadar/tools.',
    allowedTools: [
      'validate_schema', 'compile_schema', 'format_schema', 'simulate_schema',
      'parse_schema', 'test_schema', 'dev_server', 'install_deps',
      'read_pattern_registry', 'list_behaviors',
    ],
    version: '1.0.0',
  };

  const content = `# Schema Lifecycle Skill

> Teaches how to create, edit, validate, compile, and test .orb programs using tools.

${getArchitectureSection()}

---

${getSExprQuickRef()}

---

${getSchemaLifecycleSection()}

---

${getToolsByCategorySection('schema')}

---

${getToolsByCategorySection('inspect')}

---

${getCommonErrorsSection('top6')}

---

${getBindingsGuide()}

---

## Hard Rules

- validate_schema BEFORE compile_schema. Always.
- 0 errors AND 0 warnings. Warnings are treated as errors.
- read_pattern_registry before writing render-ui effects. Never invent patterns.
- list_behaviors before creating custom traits. Reuse std library.
- install_deps after compile_schema. Required for dev_server and verification.
`;

  return { name: 'almadar-schema', frontmatter, content };
}
