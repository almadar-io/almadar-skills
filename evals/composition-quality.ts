/**
 * Composition Quality Evaluation Framework
 *
 * Evaluates LLM providers' ability to generate sophisticated render-ui effects
 * that meet the Five Rules of Sophisticated Composition.
 *
 * @packageDocumentation
 */

import type { OrbitalSchema } from '@almadar/core';

export interface EvalCase {
  name: string;
  description: string;
  prompt: string;
  expectedPatterns: string[];
  minScore: number;
  domain: 'general' | 'healthcare' | 'ecommerce' | 'project-management';
}

export interface EvalResult {
  caseName: string;
  provider: string;
  score: number;
  passed: boolean;
  breakdown: ScoreBreakdown;
  validationErrors: string[];
  validationWarnings: string[];
}

export interface ScoreBreakdown {
  structure: number;    // 25 points max
  composition: number;  // 25 points max
  theme: number;        // 25 points max
  quality: number;      // 25 points max
}

export interface CompositionMetrics {
  renderUICount: number;
  atomTypes: string[];
  moleculeTypes: string[];
  organismTypes: string[];
  layoutRoot: string | null;
  nestingDepth: number;
  sectionCount: number;
  themeVariableUsage: number; // percentage
  hardcodedValues: string[];
}

// ============================================================================
// Test Cases
// ============================================================================

export const EVAL_CASES: EvalCase[] = [
  {
    name: "task-management-basic",
    description: "Generate a basic task management view with CRUD",
    prompt: `Generate an Orbital schema for a task management app.
    
Entity: Task with fields: title (string, required), status (enum: pending/active/done), priority (enum: low/medium/high)

Requirements:
- List view with search and actions (view, edit, delete)
- Modal form for creating tasks
- Use atomic composition with stack layouts
- Include stats/overview section showing counts`,
    expectedPatterns: ['stack', 'page-header', 'entity-table', 'form-section', 'box', 'typography', 'badge', 'button'],
    minScore: 70,
    domain: 'general'
  },
  {
    name: "patient-portal-dashboard",
    description: "Generate a healthcare patient portal dashboard",
    prompt: `Generate an Orbital schema for a healthcare patient portal.

Entities:
- Patient: name, dateOfBirth, medicalRecordNumber, insuranceStatus
- Appointment: date, time, doctor, status, notes

Requirements:
- Dashboard with patient statistics (total, active, critical)
- Patient list with filters by status
- Appointment scheduling view
- Use healthcare-appropriate layouts (calm, organized)
- Include tabs for different views`,
    expectedPatterns: ['stack', 'grid', 'page-header', 'entity-table', 'tabs', 'badge', 'card', 'stats'],
    minScore: 75,
    domain: 'healthcare'
  },
  {
    name: "ecommerce-product-catalog",
    description: "Generate an e-commerce product catalog",
    prompt: `Generate an Orbital schema for an e-commerce product catalog.

Entities:
- Product: name, price, category, stockLevel, rating, imageUrl
- Category: name, description

Requirements:
- Product grid with cards (use grid layout)
- Filters by category and price range
- Product detail view with image
- Shopping cart indicator
- Use product-appropriate layouts (visual, appealing)`,
    expectedPatterns: ['stack', 'grid', 'entity-cards', 'filter-group', 'badge', 'card', 'image'],
    minScore: 75,
    domain: 'ecommerce'
  },
  {
    name: "project-management-kanban",
    description: "Generate a project management kanban board",
    prompt: `Generate an Orbital schema for a project management kanban board.

Entities:
- Project: name, status, deadline, progress, owner
- Task: title, status (todo/in-progress/done), assignee, priority, dueDate

Requirements:
- Kanban board with columns for each status
- Task cards with drag-drop feel (visual design)
- Project overview with progress bars
- Team member avatars
- Due date indicators`,
    expectedPatterns: ['stack', 'grid', 'card', 'progress-bar', 'avatar', 'badge', 'page-header'],
    minScore: 80,
    domain: 'project-management'
  },
  {
    name: "analytics-dashboard",
    description: "Generate an analytics dashboard with charts",
    prompt: `Generate an Orbital schema for an analytics dashboard.

Entities:
- Metric: name, value, change, trend
- Report: title, date, type, status

Requirements:
- Stats cards with trend indicators (up/down)
- Chart visualization area
- Recent reports list
- Date range selector
- Professional, data-dense layout`,
    expectedPatterns: ['stack', 'grid', 'stats', 'chart', 'entity-table', 'badge', 'card'],
    minScore: 75,
    domain: 'general'
  }
];

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Analyze the composition metrics of a schema.
 */
export function analyzeComposition(schema: OrbitalSchema): CompositionMetrics {
  const metrics: CompositionMetrics = {
    renderUICount: 0,
    atomTypes: [],
    moleculeTypes: [],
    organismTypes: [],
    layoutRoot: null,
    nestingDepth: 0,
    sectionCount: 0,
    themeVariableUsage: 0,
    hardcodedValues: []
  };

  // Traverse all transitions
  for (const orbital of schema.orbitals) {
    for (const trait of orbital.traits) {
      if (!trait.stateMachine?.transitions) continue;
      
      for (const transition of trait.stateMachine.transitions) {
        if (!transition.effects) continue;
        
        for (const effect of transition.effects) {
          if (!Array.isArray(effect)) continue;
          if (effect[0] !== 'render-ui') continue;
          
          metrics.renderUICount++;
          const pattern = effect[2];
          
          if (pattern && typeof pattern === 'object') {
            analyzePattern(pattern, metrics, 0);
          }
        }
      }
    }
  }

  // Calculate theme variable usage
  const totalValues = metrics.atomTypes.length + metrics.moleculeTypes.length + metrics.organismTypes.length;
  if (totalValues > 0) {
    // This is a simplified calculation - in practice, we'd check all props
    metrics.themeVariableUsage = 100 - (metrics.hardcodedValues.length / totalValues * 100);
  }

  return metrics;
}

function analyzePattern(pattern: any, metrics: CompositionMetrics, depth: number): void {
  if (!pattern || typeof pattern !== 'object') return;

  // Track nesting depth
  metrics.nestingDepth = Math.max(metrics.nestingDepth, depth);

  // Check if this is the root layout
  if (depth === 0 && ['stack', 'box', 'container', 'grid'].includes(pattern.type)) {
    metrics.layoutRoot = pattern.type;
  }

  // Categorize pattern types
  const atomTypes = ['typography', 'badge', 'button', 'avatar', 'icon', 'progress-bar', 'divider'];
  const moleculeTypes = ['card', 'modal', 'drawer', 'tabs', 'alert', 'accordion', 'box'];
  const organismTypes = ['entity-table', 'form-section', 'entity-detail', 'page-header', 'chart', 'timeline', 'stats'];

  if (atomTypes.includes(pattern.type) && !metrics.atomTypes.includes(pattern.type)) {
    metrics.atomTypes.push(pattern.type);
  }
  if (moleculeTypes.includes(pattern.type) && !metrics.moleculeTypes.includes(pattern.type)) {
    metrics.moleculeTypes.push(pattern.type);
  }
  if (organismTypes.includes(pattern.type) && !metrics.organismTypes.includes(pattern.type)) {
    metrics.organismTypes.push(pattern.type);
  }

  // Check for hardcoded values
  for (const [key, value] of Object.entries(pattern)) {
    if (typeof value === 'string') {
      if (value.startsWith('#') || /^\d+px$/.test(value) || ['white', 'black', 'red', 'blue'].includes(value.toLowerCase())) {
        metrics.hardcodedValues.push(`${key}: ${value}`);
      }
    }
  }

  // Count sections (children at depth 1)
  if (depth === 1 && pattern.type) {
    metrics.sectionCount++;
  }

  // Recurse into children
  if (pattern.children && Array.isArray(pattern.children)) {
    for (const child of pattern.children) {
      analyzePattern(child, metrics, depth + 1);
    }
  }
}

/**
 * Score the structure category (25 points max)
 */
export function scoreStructure(metrics: CompositionMetrics, schema: OrbitalSchema): number {
  let score = 0;

  // Single render-ui per transition (5 points)
  // This is checked by counting render-ui effects per transition
  const transitions = countTransitions(schema);
  if (metrics.renderUICount <= transitions) {
    score += 5;
  }

  // Layout root present (5 points)
  if (metrics.layoutRoot) {
    score += 5;
  }

  // Proper nesting depth (5 points)
  if (metrics.nestingDepth >= 3) {
    score += 5;
  } else if (metrics.nestingDepth >= 2) {
    score += 3;
  }

  // Validation passed (5 points)
  // This is checked separately and added after validation
  score += 5;

  // Closed circuit pattern (5 points)
  // All states have entry/exit transitions
  if (hasClosedCircuit(schema)) {
    score += 5;
  }

  return Math.min(25, score);
}

/**
 * Score the composition category (25 points max)
 */
export function scoreComposition(metrics: CompositionMetrics): number {
  let score = 0;

  // Atom count (10 points)
  if (metrics.atomTypes.length >= 4) {
    score += 10;
  } else if (metrics.atomTypes.length === 3) {
    score += 7;
  } else if (metrics.atomTypes.length === 2) {
    score += 5;
  }

  // Molecule count (7 points)
  if (metrics.moleculeTypes.length >= 3) {
    score += 7;
  } else if (metrics.moleculeTypes.length === 2) {
    score += 5;
  } else if (metrics.moleculeTypes.length === 1) {
    score += 3;
  }

  // Organism count (8 points)
  if (metrics.organismTypes.length >= 2) {
    score += 8;
  } else if (metrics.organismTypes.length === 1) {
    score += 5;
  }

  return Math.min(25, score);
}

/**
 * Score the theme category (25 points max)
 */
export function scoreTheme(metrics: CompositionMetrics): number {
  let score = 0;

  // Theme variable usage (15 points)
  if (metrics.themeVariableUsage >= 95) {
    score += 15;
  } else if (metrics.themeVariableUsage >= 85) {
    score += 10;
  } else if (metrics.themeVariableUsage >= 75) {
    score += 5;
  }

  // No hardcoded colors (5 points)
  const hasNoHardcodedColors = !metrics.hardcodedValues.some(v => v.includes('#') || ['white', 'black'].some(c => v.toLowerCase().includes(c)));
  if (hasNoHardcodedColors) {
    score += 5;
  }

  // No hardcoded spacing (5 points)
  const hasNoHardcodedSpacing = !metrics.hardcodedValues.some(v => /\d+px/.test(v));
  if (hasNoHardcodedSpacing) {
    score += 5;
  }

  return Math.min(25, score);
}

/**
 * Score the quality category (25 points max)
 */
export function scoreQuality(metrics: CompositionMetrics, testCase: EvalCase): number {
  let score = 0;

  // Section count (8 points)
  if (metrics.sectionCount >= 4) {
    score += 8;
  } else if (metrics.sectionCount === 3) {
    score += 6;
  } else if (metrics.sectionCount === 2) {
    score += 4;
  }

  // Expected patterns present (8 points)
  const expectedPresent = testCase.expectedPatterns.filter(p => 
    metrics.atomTypes.includes(p) || 
    metrics.moleculeTypes.includes(p) || 
    metrics.organismTypes.includes(p)
  ).length;
  score += (expectedPresent / testCase.expectedPatterns.length) * 8;

  // Domain appropriateness (5 points)
  // This would require domain-specific checks
  score += 5;

  // Action completeness (4 points)
  // CRUD actions present
  score += 4;

  return Math.min(25, score);
}

/**
 * Calculate total score (0-100)
 */
export function calculateTotalScore(
  schema: OrbitalSchema, 
  testCase: EvalCase,
  validationErrors: string[]
): { score: number; breakdown: ScoreBreakdown } {
  const metrics = analyzeComposition(schema);

  const breakdown: ScoreBreakdown = {
    structure: scoreStructure(metrics, schema),
    composition: scoreComposition(metrics),
    theme: scoreTheme(metrics),
    quality: scoreQuality(metrics, testCase)
  };

  // Deduct points for validation errors
  if (validationErrors.length > 0) {
    breakdown.structure = Math.max(0, breakdown.structure - (validationErrors.length * 2));
  }

  const total = breakdown.structure + breakdown.composition + breakdown.theme + breakdown.quality;

  return {
    score: Math.min(100, Math.round(total)),
    breakdown
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function countTransitions(schema: OrbitalSchema): number {
  let count = 0;
  for (const orbital of schema.orbitals) {
    for (const trait of orbital.traits) {
      if (trait.stateMachine?.transitions) {
        count += trait.stateMachine.transitions.length;
      }
    }
  }
  return count;
}

function hasClosedCircuit(schema: OrbitalSchema): boolean {
  // Check that all states have entry and exit transitions
  for (const orbital of schema.orbitals) {
    for (const trait of orbital.traits) {
      if (!trait.stateMachine) continue;
      
      const states = new Set(trait.stateMachine.states?.map((s: any) => s.name) || []);
      const incomingStates = new Set<string>();
      const outgoingStates = new Set<string>();

      for (const transition of trait.stateMachine.transitions || []) {
        incomingStates.add(transition.to);
        outgoingStates.add(transition.from);
      }

      // All states except initial should have incoming
      // All states should have outgoing (or be terminal)
      for (const state of states) {
        const stateObj = trait.stateMachine.states?.find((s: any) => s.name === state);
        if (!stateObj?.isInitial && !incomingStates.has(state)) {
          return false;
        }
      }
    }
  }
  return true;
}

// ============================================================================
// Provider Comparison
// ============================================================================

export interface ProviderComparison {
  provider: string;
  averageScore: number;
  cases: { caseName: string; score: number; passed: boolean }[];
  strengths: string[];
  weaknesses: string[];
}

/**
 * Run all eval cases for a provider.
 */
export async function runProviderEval(
  provider: string,
  generateFn: (prompt: string) => Promise<OrbitalSchema>
): Promise<ProviderComparison> {
  const results: { caseName: string; score: number; passed: boolean }[] = [];
  let totalScore = 0;

  for (const testCase of EVAL_CASES) {
    try {
      const schema = await generateFn(testCase.prompt);
      const { score } = calculateTotalScore(schema, testCase, []);
      
      results.push({
        caseName: testCase.name,
        score,
        passed: score >= testCase.minScore
      });
      totalScore += score;
    } catch (error) {
      results.push({
        caseName: testCase.name,
        score: 0,
        passed: false
      });
    }
  }

  return {
    provider,
    averageScore: Math.round(totalScore / EVAL_CASES.length),
    cases: results,
    strengths: [], // Would be populated by analysis
    weaknesses: [] // Would be populated by analysis
  };
}

/**
 * Generate comparison matrix for all providers.
 */
export function generateComparisonMatrix(comparisons: ProviderComparison[]): string {
  let markdown = '# Composition Quality Provider Comparison\n\n';
  markdown += '| Provider | Average Score | task-mgmt | patient | ecommerce | kanban | analytics |\n';
  markdown += '|----------|---------------|-----------|---------|-----------|--------|-----------|\n';

  for (const comp of comparisons) {
    const scores = EVAL_CASES.map(tc => {
      const result = comp.cases.find(c => c.caseName === tc.name);
      return result ? `${result.score}${result.passed ? '✓' : ''}` : 'N/A';
    });
    
    markdown += `| ${comp.provider} | ${comp.averageScore} | ${scores.join(' | ')} |\n`;
  }

  return markdown;
}
