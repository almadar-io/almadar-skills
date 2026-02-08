/**
 * Skill Generator Types
 *
 * Shared types for all skill generators.
 *
 * @packageDocumentation
 */

/**
 * Skill frontmatter metadata.
 */
export interface SkillFrontmatter {
  name: string;
  description: string;
  allowedTools?: string[];
  version?: string;
}

/**
 * Generated skill output.
 */
export interface GeneratedSkill {
  name: string;
  frontmatter: SkillFrontmatter;
  content: string;
  references?: Record<string, string>;
}
