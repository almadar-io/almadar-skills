/**
 * Skill Generator Utilities
 *
 * Shared utilities for formatting and writing skill files.
 *
 * @packageDocumentation
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { SkillFrontmatter, GeneratedSkill } from './types.js';

/**
 * Format skill frontmatter to YAML.
 */
export function formatFrontmatter(fm: SkillFrontmatter): string {
  const lines = ['---'];
  lines.push(`name: ${fm.name}`);
  lines.push(`description: ${fm.description}`);
  if (fm.allowedTools?.length) {
    lines.push(`allowed-tools: ${fm.allowedTools.join(', ')}`);
  }
  if (fm.version) {
    lines.push(`version: ${fm.version}`);
  }
  lines.push('---');
  return lines.join('\n');
}

/**
 * Write a skill to the filesystem.
 */
export function writeSkill(skill: GeneratedSkill, baseDir: string): void {
  const skillDir = join(baseDir, skill.name);

  if (!existsSync(skillDir)) {
    mkdirSync(skillDir, { recursive: true });
  }

  const skillMd = formatFrontmatter(skill.frontmatter) + '\n\n' + skill.content;
  writeFileSync(join(skillDir, 'SKILL.md'), skillMd);
  console.log(`  ✓ ${skill.name}/SKILL.md`);

  if (skill.references) {
    const refsDir = join(skillDir, 'references');
    if (!existsSync(refsDir)) {
      mkdirSync(refsDir, { recursive: true });
    }

    for (const [filename, content] of Object.entries(skill.references)) {
      writeFileSync(join(refsDir, filename), content);
      console.log(`  ✓ ${skill.name}/references/${filename}`);
    }
  }
}

/**
 * Write all skills to the filesystem.
 */
export function writeAllSkills(skills: GeneratedSkill[], baseDir: string): void {
  console.log(`\nWriting ${skills.length} skills to ${baseDir}...`);

  for (const skill of skills) {
    writeSkill(skill, baseDir);
  }

  console.log(`\n✓ Generated ${skills.length} skills`);
}
