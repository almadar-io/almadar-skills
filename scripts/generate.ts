#!/usr/bin/env node
/**
 * Generate Skills Script
 *
 * Generates all skills to the .skills/ directory.
 *
 * Usage:
 *   pnpm generate              # Generate all skills
 *   pnpm generate list         # List available skills
 *   pnpm generate preview NAME # Preview a specific skill
 */

import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  generateAllBuilderSkills,
  writeAllSkills,
  formatFrontmatter,
} from '../dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', '.skills');

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const command = process.argv[2];

switch (command) {
  case 'list': {
    console.log('\n📚 Available Skills:\n');
    const skills = generateAllBuilderSkills();
    for (const skill of skills) {
      console.log(`  • ${skill.name}`);
      console.log(`    ${skill.frontmatter.description.slice(0, 70)}...`);
      console.log();
    }
    console.log(`Total: ${skills.length} skills\n`);
    break;
  }

  case 'preview': {
    const name = process.argv[3];
    if (!name) {
      console.error('❌ Please provide a skill name');
      console.log('Usage: pnpm generate preview <skill-name>');
      process.exit(1);
    }

    const skills = generateAllBuilderSkills();
    const skill = skills.find((s) => s.name === name);

    if (!skill) {
      console.error(`❌ Skill not found: ${name}`);
      console.log('\nAvailable skills:');
      skills.forEach((s) => console.log(`  • ${s.name}`));
      process.exit(1);
    }

    console.log('\n' + formatFrontmatter(skill.frontmatter));
    console.log('\n' + skill.content);
    break;
  }

  case undefined:
  default: {
    console.log('\n🎯 Generating all skills...\n');
    const skills = generateAllBuilderSkills();
    writeAllSkills(skills, OUTPUT_DIR);
    console.log(`\n✅ Generated ${skills.length} skills to ${OUTPUT_DIR}\n`);
    break;
  }
}
