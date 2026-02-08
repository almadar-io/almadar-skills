import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // Single entry point that re-exports everything
  format: ['esm'],
  dts: true, // TypeScript declarations enabled
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
});
