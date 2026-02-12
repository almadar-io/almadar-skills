import { getSkillSizeComparison } from './src/orbitals-skills-generators/lean-orbital-skill-generator.js';

console.log('=== SKILL SIZE COMPARISON ===\n');
const comparison = getSkillSizeComparison();

for (const [name, stats] of Object.entries(comparison)) {
  const kb = (stats.chars / 1024).toFixed(2);
  console.log(`${name.padEnd(25)} ${stats.chars.toLocaleString().padStart(10)} bytes (${kb} KB) | ${stats.lines} lines`);
}

console.log('\n=== SIZE REDUCTIONS ===');
const minKB = comparison.minimal.chars / 1024;
const withStdKB = comparison.withStdFull.chars / 1024;
const legacyKB = comparison.legacy.chars / 1024;

console.log(`Minimal vs Full Std:       ${((1 - minKB/withStdKB) * 100).toFixed(1)}% smaller`);
console.log(`Minimal vs Legacy:         ${((1 - minKB/legacyKB) * 100).toFixed(1)}% smaller`);
console.log(`With Std Full vs Legacy:   ${((1 - withStdKB/legacyKB) * 100).toFixed(1)}% smaller`);
