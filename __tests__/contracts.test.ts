import { describe, it, expect } from 'vitest';
import type { SkillsServiceContract, SkillsEventMap } from '../src/contracts';
import type { ServiceEvents } from '@almadar/core';

describe('SkillsServiceContract', () => {
  it('can be implemented with correct action signatures', async () => {
    const mock: SkillsServiceContract = {
      async execute(action, params) {
        if (action === 'generateOrbitals') {
          return { skill: { name: 'todo', content: 'entity Todo { ... }' } };
        }
        if (action === 'generateFix') {
          return { skill: { name: 'fix', content: 'fixed schema' } };
        }
        if (action === 'generateDomainLanguage') {
          return { skill: { name: 'domain', content: 'domain def' } };
        }
        if (action === 'generateAll') {
          return { skills: [{ name: 'all', content: 'all skills' }] };
        }
        throw new Error(`Unknown action: ${action}`);
      },
    };

    const result = await mock.execute('generateOrbitals', { prompt: 'Build a todo app' });
    expect(result.skill.name).toBe('todo');
    expect(result.skill.content).toContain('entity');
  });

  it('dispatches generateFix with errors', async () => {
    const mock: SkillsServiceContract = {
      async execute(action, params) {
        if (action === 'generateFix') {
          return { skill: { name: 'fix', content: `Fixed ${params.errors.length} errors` } };
        }
        throw new Error(`Unknown action: ${action}`);
      },
    };

    const result = await mock.execute('generateFix', {
      schema: 'entity Broken {}',
      errors: ['missing field', 'invalid type'],
    });
    expect(result.skill.content).toBe('Fixed 2 errors');
  });
});

describe('SkillsEventMap', () => {
  it('provides typed emit/on via ServiceEvents', () => {
    const mockBus: ServiceEvents<SkillsEventMap> = {
      emit(_event, _payload) { /* no-op */ },
      on(_event, _handler) { return () => {}; },
    };

    mockBus.emit('SKILL_GENERATION_STARTED', { skill: 'orbitals', prompt: 'Build a todo app' });
    mockBus.emit('SKILL_GENERATION_COMPLETED', { skill: 'orbitals', durationMs: 1500 });

    const unsub = mockBus.on('SKILL_VALIDATION_FAILED', (payload) => {
      expect(payload.errors).toBeInstanceOf(Array);
    });
    expect(typeof unsub).toBe('function');
  });
});
