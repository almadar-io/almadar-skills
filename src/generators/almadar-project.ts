/**
 * almadar-project Skill Generator
 *
 * Teaches project lifecycle: create, list, migrate, deploy, monitor.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
  getProjectStructureSection,
  getToolsByCategorySection,
} from '../prompts/skill-sections/index.js';

export function generateAlmadarProjectSkill(): GeneratedSkill {
  const frontmatter = {
    name: 'almadar-project',
    description: 'Project operations: create, list, migrate to standalone, deploy, monitor CI/CD, generate architecture docs.',
    allowedTools: [
      'create_project', 'list_projects', 'migrate_standalone',
      'gha_workflow_status', 'gha_deploy_status', 'architecture_generate',
      'security_audit',
    ],
    version: '1.0.0',
  };

  const content = `# Project Operations Skill

> Teaches how to manage Almadar projects: create, deploy, monitor, document.

${getProjectStructureSection()}

---

${getToolsByCategorySection('scaffold')}

---

${getToolsByCategorySection('inspect')}

---

## Project Lifecycle

\`\`\`
DISCOVER       list_projects         See all projects and their state
CREATE         create_project        Scaffold new project with schema + design system
DEVELOP        (use almadar-schema skill for .orb editing)
DOCUMENT       architecture_generate  C4 diagrams, proposals for client handoff
AUDIT          security_audit         Before any release
DEPLOY         migrate_standalone     When ready for independent deployment (irreversible)
MONITOR        gha_workflow_status    Check CI builds/publishes
               gha_deploy_status     Check Firebase App Hosting rollouts
\`\`\`

## Publishing @almadar/* Packages

NEVER publish manually. Always go through GitHub Actions:

1. Bump version in package.json
2. Commit, push tag: \`git tag v{version} && git push origin main --tags\`
3. CI pipeline: checkout -> pnpm install -> build -> pnpm publish
4. Push tags in dependency order (upstream first):
   operators -> patterns -> core -> evaluator -> std -> ui

## Firebase App Hosting

- Backend quota: 10 per region (europe-west4), currently at 10/10
- Re-deploy: change .orb -> recompile -> commit app/ -> push -> auto-rollout
- Logs: \`gcloud logging read\` with resource.type="cloud_run_revision"
`;

  return { name: 'almadar-project', frontmatter, content };
}
