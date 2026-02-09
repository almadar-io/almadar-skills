#!/usr/bin/env node

/**
 * Quick test to verify eval structure is correct
 */

import { globSync } from 'glob';
import fs from 'fs/promises';
import path from 'path';

async function testEvalStructure() {
  console.log('Testing eval case structure...\n');

  const casesDir = path.join(process.cwd(), 'evals/cases');
  const files = globSync('**/*.json', { cwd: casesDir, absolute: true });

  console.log(`Found ${files.length} test case(s):\n`);

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const evalCase = JSON.parse(content);

      // Validate structure
      const required = ['id', 'description', 'prompt', 'semanticExpectations'];
      const missing = required.filter((field) => !evalCase[field]);

      if (missing.length > 0) {
        console.log(`❌ ${path.relative(casesDir, file)}`);
        console.log(`   Missing fields: ${missing.join(', ')}`);
      } else {
        console.log(`✅ ${path.relative(casesDir, file)}`);
        console.log(`   ID: ${evalCase.id}`);
        console.log(`   Description: ${evalCase.description}`);
        console.log(`   Expectations: ${evalCase.semanticExpectations.length}`);
        console.log(`   Tags: ${(evalCase.tags || []).join(', ') || 'none'}`);
      }
      console.log();
    } catch (error: any) {
      console.log(`❌ ${path.relative(casesDir, file)}`);
      console.log(`   Error: ${error.message}`);
      console.log();
    }
  }

  console.log('Structure test complete!\n');
  console.log('To run actual evals, set your OPENAI_API_KEY and run:');
  console.log('  pnpm eval');
}

testEvalStructure().catch(console.error);
