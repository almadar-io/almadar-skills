#!/usr/bin/env node

/**
 * CLI for running evals
 */

import { Command } from 'commander';
// CLI temporarily disabled - use runner.ts directly via `pnpm evals:run`
import type { RunOptions } from './types.js';
import fs from 'fs/promises';

const program = new Command();

program
  .name('almadar-eval')
  .description('Run evaluations for Almadar skills')
  .version('1.0.0');

program
  .option('-f, --filter <pattern>', 'Glob pattern for case files (default: all)')
  .option('-t, --tags <tags>', 'Comma-separated tags to filter by')
  .option('-p, --provider <provider>', 'LLM provider (openai, anthropic, deepseek)')
  .option('-m, --model <model>', 'Model to use')
  .option('-c, --concurrency <number>', 'Max concurrent eval cases', '3')
  .option('--format <format>', 'Output format (text, json, markdown)', 'text')
  .action(async (options) => {
    try {
      const runOptions: RunOptions = {
        filter: options.filter,
        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : undefined,
        provider: options.provider,
        model: options.model,
        concurrency: parseInt(options.concurrency, 10),
        format: options.format,
      };

      console.log('Starting eval run...\n');

      console.log('CLI temporarily disabled. Please use runner.ts directly.');
      process.exit(0);

      // Output based on format
      if (runOptions.format === 'json') {
        console.log(JSON.stringify(report, null, 2));
      } else if (runOptions.format === 'markdown') {
        printMarkdownReport(report);
      } else {
        printTextReport(report);
      }

      // Exit with error code if pass rate is too low
      if (report.passRate < 0.7) {
        process.exit(1);
      }
    } catch (error: any) {
      console.error('Error running evals:', error.message);
      process.exit(1);
    }
  });

program
  .command('compare <report1> <report2>')
  .description('Compare two eval reports')
  .action(async (report1Path: string, report2Path: string) => {
    try {
      const report1 = JSON.parse(await fs.readFile(report1Path, 'utf-8'));
      const report2 = JSON.parse(await fs.readFile(report2Path, 'utf-8'));

      console.log(`\nComparing: ${report1.timestamp} vs ${report2.timestamp}`);
      console.log('─'.repeat(60));

      const passRateDiff = ((report2.passRate - report1.passRate) * 100);
      const avgScoreDiff = ((report2.averageScore - report1.averageScore) * 100);

      console.log(
        `Overall:      ${(report1.passRate * 100).toFixed(0)}% → ${(
          report2.passRate * 100
        ).toFixed(0)}% (${passRateDiff > 0 ? '+' : ''}${passRateDiff.toFixed(1)}%)`
      );
      console.log(
        `Avg Score:    ${(report1.averageScore * 100).toFixed(0)}% → ${(
          report2.averageScore * 100
        ).toFixed(0)}% (${avgScoreDiff > 0 ? '+' : ''}${avgScoreDiff.toFixed(1)}%)`
      );

      console.log('\nPer category:');
      const allCategories = new Set([
        ...Object.keys(report1.categories),
        ...Object.keys(report2.categories),
      ]);

      for (const category of allCategories) {
        const cat1 = report1.categories[category] || { passRate: 0, avgScore: 0 };
        const cat2 = report2.categories[category] || { passRate: 0, avgScore: 0 };
        const diff = ((cat2.passRate - cat1.passRate) * 100);

        console.log(
          `  ${category.padEnd(15)} ${(cat1.passRate * 100).toFixed(0)}% → ${(
            cat2.passRate * 100
          ).toFixed(0)}% (${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)`
        );
      }

      // Find regressions and improvements
      const regressions: string[] = [];
      const improvements: string[] = [];

      const caseMap1 = new Map(report1.results.map((r: any) => [r.caseId, r]));
      const caseMap2 = new Map(report2.results.map((r: any) => [r.caseId, r]));

      for (const [caseId, result1] of caseMap1) {
        const result2 = caseMap2.get(caseId);
        if (!result2) continue;

        const r1 = result1 as { pass?: boolean; score?: number };
        const r2 = result2 as { pass?: boolean; score?: number };
        if (r1.pass && !r2.pass) {
          regressions.push(`${caseId}: PASS → FAIL (score: ${(r2.score || 0).toFixed(2)})`);
        } else if (!r1.pass && r2.pass) {
          improvements.push(`${caseId}: FAIL → PASS (score: ${(r2.score || 0).toFixed(2)})`);
        }
      }

      if (regressions.length > 0) {
        console.log('\n❌ Regressions:');
        regressions.forEach((r) => console.log(`  - ${r}`));
      }

      if (improvements.length > 0) {
        console.log('\n✅ Improvements:');
        improvements.forEach((i) => console.log(`  - ${i}`));
      }
    } catch (error: any) {
      console.error('Error comparing reports:', error.message);
      process.exit(1);
    }
  });

function printTextReport(report: any): void {
  console.log('\n' + '='.repeat(60));
  console.log('Eval Report');
  console.log('='.repeat(60));
  console.log(`Timestamp:    ${report.timestamp}`);
  console.log(`Model:        ${report.model}`);
  console.log(`Skill:        v${report.skillVersion}`);
  console.log(`Pass Rate:    ${(report.passRate * 100).toFixed(1)}%`);
  console.log(`Avg Score:    ${(report.averageScore * 100).toFixed(1)}%`);
  console.log(`Total Cost:   ${report.totalCost}`);
  console.log('─'.repeat(60));

  console.log('\nCategory Breakdown:');
  for (const [category, stats] of Object.entries(report.categories)) {
    const s = stats as any;
    console.log(
      `  ${category.padEnd(15)} Pass: ${(s.passRate * 100).toFixed(0)}%  Score: ${(
        s.avgScore * 100
      ).toFixed(0)}%  Count: ${s.count}`
    );
  }

  console.log('\nResults:');
  for (const result of report.results) {
    const icon = result.pass ? '✅' : '❌';
    const score = (result.score * 100).toFixed(0);
    console.log(`  ${icon} ${result.caseId.padEnd(30)} Score: ${score}%`);

    if (!result.pass) {
      if (!result.cliValidation.pass) {
        console.log(`      CLI validation failed`);
        result.cliValidation.errors.forEach((e: string) => console.log(`      - ${e}`));
      } else {
        console.log(`      Semantic validation failed`);
        result.semanticValidation.expectations
          .filter((e: any) => !e.met)
          .forEach((e: any) => console.log(`      - ${e.expectation}: ${e.reasoning}`));
      }
    }
  }

  console.log('\n' + '='.repeat(60));
}

function printMarkdownReport(report: any): void {
  console.log('# Eval Report\n');
  console.log(`**Timestamp:** ${report.timestamp}  `);
  console.log(`**Model:** ${report.model}  `);
  console.log(`**Skill:** v${report.skillVersion}  `);
  console.log(`**Pass Rate:** ${(report.passRate * 100).toFixed(1)}%  `);
  console.log(`**Avg Score:** ${(report.averageScore * 100).toFixed(1)}%  `);
  console.log(`**Total Cost:** ${report.totalCost}\n`);

  console.log('## Category Breakdown\n');
  console.log('| Category | Pass Rate | Avg Score | Count |');
  console.log('|----------|-----------|-----------|-------|');
  for (const [category, stats] of Object.entries(report.categories)) {
    const s = stats as any;
    console.log(
      `| ${category} | ${(s.passRate * 100).toFixed(0)}% | ${(s.avgScore * 100).toFixed(
        0
      )}% | ${s.count} |`
    );
  }

  console.log('\n## Results\n');
  console.log('| Case | Pass | Score | Notes |');
  console.log('|------|------|-------|-------|');
  for (const result of report.results) {
    const pass = result.pass ? '✅' : '❌';
    const score = (result.score * 100).toFixed(0);
    const notes = result.pass
      ? ''
      : result.cliValidation.pass
      ? 'Semantic validation failed'
      : 'CLI validation failed';
    console.log(`| ${result.caseId} | ${pass} | ${score}% | ${notes} |`);
  }
}

program.parse();
