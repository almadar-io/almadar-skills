#!/usr/bin/env node
/**
 * Install Skills Script
 *
 * Installs generated skills to ~/.deepagents/kflow/skills/ directory.
 *
 * Usage:
 *   pnpm install:skills           # Install all skills
 *   pnpm install:skills --check   # Check installation status
 *   pnpm install:skills --clean   # Clean and reinstall
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateAllBuilderSkills, writeAllSkills } from '../dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const AGENT_NAME = 'kflow';
const DEEPAGENTS_DIR = join(homedir(), '.deepagents');
const AGENT_DIR = join(DEEPAGENTS_DIR, AGENT_NAME);
const SKILLS_DIR = join(AGENT_DIR, 'skills');
const SOURCE_DIR = join(__dirname, '..', '.skills');

// Parse arguments
const args = process.argv.slice(2);
const shouldCheck = args.includes('--check');
const shouldClean = args.includes('--clean');

/**
 * Check installation status
 */
function checkInstallation(): void {
  console.log('\n🔍 Checking installation...\n');

  if (!existsSync(DEEPAGENTS_DIR)) {
    console.log('❌ .deepagents directory not found:', DEEPAGENTS_DIR);
    console.log('   Run: mkdir -p ~/.deepagents/kflow/skills\n');
    return;
  }

  if (!existsSync(AGENT_DIR)) {
    console.log('❌ kflow agent directory not found:', AGENT_DIR);
    console.log('   Run: mkdir -p ~/.deepagents/kflow/skills\n');
    return;
  }

  if (!existsSync(SKILLS_DIR)) {
    console.log('❌ skills directory not found:', SKILLS_DIR);
    console.log('   Run: mkdir -p ~/.deepagents/kflow/skills\n');
    return;
  }

  console.log('✅ Directories exist');
  console.log(`   ${SKILLS_DIR}\n`);

  // Check installed skills
  const installedSkills = readdirSync(SKILLS_DIR);
  if (installedSkills.length === 0) {
    console.log('⚠️  No skills installed\n');
  } else {
    console.log(`📚 Installed skills (${installedSkills.length}):\n`);
    installedSkills.forEach((skill) => {
      const skillFile = join(SKILLS_DIR, skill, 'SKILL.md');
      const exists = existsSync(skillFile);
      console.log(`   ${exists ? '✅' : '❌'} ${skill}`);
    });
    console.log();
  }
}

/**
 * Clean installation
 */
function cleanInstallation(): void {
  console.log('\n🧹 Cleaning installation...\n');

  if (existsSync(SKILLS_DIR)) {
    rmSync(SKILLS_DIR, { recursive: true, force: true });
    console.log('✅ Removed existing skills\n');
  } else {
    console.log('⚠️  No skills directory to clean\n');
  }
}

/**
 * Install skills
 */
function installSkills(): void {
  console.log('\n📦 Installing skills...\n');

  // Ensure directories exist
  if (!existsSync(SKILLS_DIR)) {
    mkdirSync(SKILLS_DIR, { recursive: true });
    console.log('✅ Created skills directory:', SKILLS_DIR);
  }

  // Generate skills first if not already generated
  if (!existsSync(SOURCE_DIR)) {
    console.log('📝 Generating skills first...\n');
    mkdirSync(SOURCE_DIR, { recursive: true });
    const skills = generateAllBuilderSkills();
    writeAllSkills(skills, SOURCE_DIR);
  }

  // Copy skills to installation directory
  const skills = readdirSync(SOURCE_DIR);
  let installed = 0;

  for (const skillName of skills) {
    const sourceSkillDir = join(SOURCE_DIR, skillName);
    const targetSkillDir = join(SKILLS_DIR, skillName);

    if (!existsSync(sourceSkillDir)) continue;

    // Create skill directory
    if (!existsSync(targetSkillDir)) {
      mkdirSync(targetSkillDir, { recursive: true });
    }

    // Copy SKILL.md
    const sourceFile = join(sourceSkillDir, 'SKILL.md');
    const targetFile = join(targetSkillDir, 'SKILL.md');

    if (existsSync(sourceFile)) {
      copyFileSync(sourceFile, targetFile);
      console.log(`   ✅ ${skillName}`);
      installed++;
    }
  }

  console.log(`\n✅ Installed ${installed} skills to ${SKILLS_DIR}\n`);
}

/**
 * Main
 */
function main(): void {
  if (shouldCheck) {
    checkInstallation();
  } else if (shouldClean) {
    cleanInstallation();
    installSkills();
  } else {
    installSkills();
  }
}

main();
