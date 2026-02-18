/**
 * KFlow Orbital Fixing Skill Generator
 *
 * Generates the kflow-orbital-fixing skill for fixing validation errors
 * using orbital understanding. Uses the LEAN fixing skill generator from the
 * orbitals module for reduced token usage.
 *
 * @packageDocumentation
 */

import type { GeneratedSkill } from './types.js';
import {
    generateLeanFixingSkill,
    getFixingSkillMetadata,
} from '../orbitals-skills-generators/lean-fixing-skill-generator.js';

/**
 * Generate the kflow-orbital-fixing skill.
 *
 * Uses the lean generator which:
 * - Shares sections with lean-orbital-skill-generator
 * - Adds fixing-specific workflow and patterns
 * - ~42% smaller than the original generator
 */
export function generateKflowOrbitalFixingSkill(): GeneratedSkill {
    const metadata = getFixingSkillMetadata();

    const frontmatter = {
        name: metadata.name,
        description: metadata.description,
        allowedTools: ['Read', 'Edit', 'Bash', 'query_schema_structure', 'extract_chunk', 'apply_chunk'],
        version: metadata.version,
    };

    // Generate lean fixing skill content
    const content = generateLeanFixingSkill({
        includeOverGeneration: true,
        includeSchemaUpdates: true,
        includeEfficiency: true,
    });

    return {
        name: metadata.name,
        frontmatter,
        content,
    };
}
