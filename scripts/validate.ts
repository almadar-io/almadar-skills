#!/usr/bin/env node
/**
 * Validate Skills Script
 *
 * Validates that all generated skills are properly formatted.
 *
 * Usage:
 *   pnpm validate
 */

import { generateAllBuilderSkills } from '../dist/index.js';

function validateSkill(skill: any): string[] {
  const errors: string[] = [];

  // Check frontmatter
  if (!skill.frontmatter) {
    errors.push('Missing frontmatter');
  } else {
    if (!skill.frontmatter.name) errors.push('Missing frontmatter.name');
    if (!skill.frontmatter.description) errors.push('Missing frontmatter.description');
  }

  // Check content
  if (!skill.content || skill.content.trim().length === 0) {
    errors.push('Empty content');
  }

  // Check content length (should be reasonable)
  if (skill.content && skill.content.length < 100) {
    errors.push('Content too short (< 100 chars)');
  }

  return errors;
}

console.log('\n🔍 Validating skills...\n');

const skills = generateAllBuilderSkills();
let valid = 0;
let invalid = 0;

for (const skill of skills) {
  const errors = validateSkill(skill);

  if (errors.length === 0) {
    console.log(`✅ ${skill.name}`);
    valid++;
  } else {
    console.log(`❌ ${skill.name}`);
    errors.forEach((error) => console.log(`   • ${error}`));
    invalid++;
  }
}

console.log(`\n📊 Results: ${valid} valid, ${invalid} invalid\n`);

if (invalid > 0) {
  process.exit(1);
}
