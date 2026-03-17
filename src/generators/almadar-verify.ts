/**
 * almadar-verify Skill Generator
 *
 * Teaches an agent how to prove a schema produces a working app.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
  getVerificationSection,
  getToolsByCategorySection,
} from '../prompts/skill-sections/index.js';

export function generateAlmadarVerifySkill(): GeneratedSkill {
  const frontmatter = {
    name: 'almadar-verify',
    description: 'Verification: prove a schema produces a working app using orbital-verify, runtime-verify, storybook, screenshots, and lint.',
    allowedTools: [
      'verify_orbital', 'verify_behaviors', 'verify_runtime', 'verify_parity',
      'browser_console', 'screenshot', 'lint_files', 'storybook_verify',
    ],
    version: '1.0.0',
  };

  const content = `# Verification Skill

> Teaches how to prove a schema produces a working application.

${getVerificationSection()}

---

${getToolsByCategorySection('verify')}

---

## verify_orbital Details

The primary verification tool. Runs 4 phases:

1. **Static Analysis**: schema parsing, pattern validation, circuit integrity
2. **Compile + Install**: Rust compiler to TypeScript, pnpm install
3. **Server Verification**: 10 test sections via HTTP (health, auth, transitions, BFS walk)
4. **Browser Verification**: Playwright (DOM patterns, interactions, CRUD, event coverage)

Always run with \`--headed --screenshots\`. After screenshots are captured,
review each PNG for: empty content, no styling, broken layout, missing UI,
compile errors, runtime errors. Verification is NOT complete until screenshots pass.

---

## Screenshot Review Checklist

After any \`--screenshots\` run, check each PNG for:

| Category | What to Look For |
|----------|-----------------|
| empty-content | Page renders but shows no data or components |
| no-styling | Components render but have no CSS (raw HTML look) |
| broken-layout | Overlapping elements, overflow, misalignment |
| missing-ui | Expected components not rendered (blank areas) |
| compile-error | Red error overlay or stack trace visible |
| runtime-error | Console errors visible in page |
| other | Anything that looks wrong but doesn't fit above |

---

## lint_files is MANDATORY

Run on EVERY file you touched before declaring work done.
Zero tolerance: any error blocks the commit.
Fix all errors, even pre-existing ones in files you edited.
`;

  return { name: 'almadar-verify', frontmatter, content };
}
