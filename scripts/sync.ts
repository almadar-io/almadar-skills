#!/usr/bin/env node
/**
 * Sync Skills Script
 *
 * Syncs generated skills back to the builder for development/testing.
 *
 * Usage:
 *   pnpm sync               # Sync to builder
 *   pnpm sync --dry-run     # Show what would be synced
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { generateAllBuilderSkills, writeAllSkills } from '../dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const WORKSPACE_ROOT = join(__dirname, '../../..');
const BUILDER_SKILLS_DIR = join(
  WORKSPACE_ROOT,
  'apps/builder/packages/shared/src/agents/deepagent/skills'
);
const SOURCE_DIR = join(__dirname, '..', '.skills');

const isDryRun = process.argv.includes('--dry-run');

console.log('\n🔄 Syncing skills to builder...\n');

if (isDryRun) {
  console.log('🏃 Dry run mode - no files will be modified\n');
}

// Check if builder exists
if (!existsSync(BUILDER_SKILLS_DIR)) {
  console.error('❌ Builder skills directory not found:', BUILDER_SKILLS_DIR);
  console.log('   Are you running from the monorepo?');
  process.exit(1);
}

// Generate skills first
console.log('📝 Generating skills...\n');
if (!existsSync(SOURCE_DIR)) {
  mkdirSync(SOURCE_DIR, { recursive: true });
}
const skills = generateAllBuilderSkills();
writeAllSkills(skills, SOURCE_DIR);

// Sync each skill
const skillNames = readdirSync(SOURCE_DIR);
let synced = 0;

for (const skillName of skillNames) {
  const sourceSkillDir = join(SOURCE_DIR, skillName);
  const targetSkillDir = join(BUILDER_SKILLS_DIR, skillName);

  if (!existsSync(sourceSkillDir)) continue;

  const sourceFile = join(sourceSkillDir, 'SKILL.md');
  const targetFile = join(targetSkillDir, 'SKILL.md');

  if (!existsSync(sourceFile)) continue;

  if (isDryRun) {
    console.log(`   📄 Would sync: ${skillName}`);
  } else {
    // Create target directory if needed
    if (!existsSync(targetSkillDir)) {
      mkdirSync(targetSkillDir, { recursive: true });
    }

    // Copy file
    copyFileSync(sourceFile, targetFile);
    console.log(`   ✅ ${skillName}`);
  }

  synced++;
}

if (isDryRun) {
  console.log(`\n📊 Would sync ${synced} skills\n`);
} else {
  console.log(`\n✅ Synced ${synced} skills to builder\n`);
}
