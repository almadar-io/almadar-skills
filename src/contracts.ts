/**
 * Skills Service Contract
 *
 * Defines the call-service-compatible actions for the Skills service.
 * Skills are stateless generators that produce Orbital schemas and
 * domain language definitions from natural-language prompts.
 *
 * These actions can be invoked from `.orb` schemas via
 * `["call-service", "skills", "<action>", {...}]`.
 *
 * @packageDocumentation
 */

import type { ServiceContract, ServiceEvents } from "@almadar/core";

/**
 * All call-service actions exposed by the Skills service.
 */
export type SkillsServiceActions = {
  /** Generate Orbital schemas from a natural-language prompt. */
  generateOrbitals: {
    params: {
      prompt: string;
      compact?: boolean;
    };
    result: {
      skill: { name: string; content: string };
    };
  };

  /** Generate a fix for an existing schema given validation errors. */
  generateFix: {
    params: {
      schema: string;
      errors: string[];
    };
    result: {
      skill: { name: string; content: string };
    };
  };

  /** Generate a domain language definition from a description. */
  generateDomainLanguage: {
    params: {
      description: string;
    };
    result: {
      skill: { name: string; content: string };
    };
  };

  /** Generate all available skills. */
  generateAll: {
    params: Record<string, never>;
    result: {
      skills: Array<{ name: string; content: string }>;
    };
  };
};

/**
 * The full service contract for the Skills service.
 * Implementations must provide an `execute(action, params)` method
 * that dispatches to the correct action handler.
 */
export type SkillsServiceContract = ServiceContract<SkillsServiceActions>;

// ============================================================================
// Event Map
// ============================================================================

/** Events emitted during skill generation. */
export type SkillsEventMap = {
  SKILL_GENERATION_STARTED: { skill: string; prompt: string };
  SKILL_GENERATION_COMPLETED: { skill: string; durationMs: number };
  SKILL_GENERATION_FAILED: { skill: string; error: string };
  SKILL_VALIDATION_PASSED: { skill: string; schema: string };
  SKILL_VALIDATION_FAILED: { skill: string; errors: string[] };
};

/** Typed event emitter for skills events. */
export type SkillsServiceEvents = ServiceEvents<SkillsEventMap>;
