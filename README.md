# @almadar/skills

AI skill generators and prompts for Orbital schema generation.

## Overview

This package provides the core skills used by the KFlow Builder client to generate and fix Orbital schemas using AI agents.

## Core Skills

### 1. kflow-orbitals (Standard Generation)
Generate complete Orbital schemas using JSON output with the Orbital Unit composition model.

### 2. kflow-orbital-fixing (Standard Fixing)
Fix compilation errors, validation errors, and schema issues using orbital-aware fixing.

### 3. kflow-lean-orbitals (Lean Generation)
Generate schemas using Domain Language output (~5x fewer tokens than JSON).

### 4. kflow-lean-fixing (Lean Fixing)
Fix validation errors using Domain Language output.

### 5. domain-language
Understand, generate, and summarize Orbital Domain Language (ODL).

## Installation

```bash
pnpm add @almadar/skills
```

## Usage

### As a Library

```typescript
import {
  generateKflowOrbitalsSkill,
  generateKflowOrbitalFixingSkill,
  generateDomainLanguageSkill,
  generateLeanOrbitalSkill,
  generateLeanFixingSkill,
  generateAllBuilderSkills
} from '@almadar/skills';

// Generate a single skill
const skill = generateKflowOrbitalsSkill();
console.log(skill.frontmatter); // { name, description, allowedTools, version }
console.log(skill.content);     // Full skill markdown content

// Generate all builder skills
const allSkills = generateAllBuilderSkills();
```

### CLI Scripts

This package includes several npm scripts for managing skills:

#### Generate Skills

```bash
# Generate all skills to .skills/ directory
pnpm generate

# List available skills
pnpm generate:list

# Preview a specific skill
pnpm generate:preview kflow-orbitals
```

#### Install to .deepagents

```bash
# Install skills to ~/.deepagents/kflow/skills/
pnpm install:skills

# Check installation status
pnpm install:check

# Clean and reinstall
pnpm install:clean
```

#### Validation

```bash
# Validate all generated skills
pnpm validate
```

#### Development

```bash
# Sync skills to builder (for monorepo development)
pnpm sync

# Dry run - show what would be synced
pnpm sync:dry

# Clean generated files
pnpm clean
```

## Development Status

✅ **Refactored and Building Successfully**

### Architecture

This package now follows a clean architecture:

- **Keeps**: Only skill-sections (11 reusable guidance sections)
- **Imports**: Everything else from @almadar/* packages
- **Inlines**: Lean-specific constants for domain language skills

### Package Size

- **Before**: ~60 prompt files, 16,321 lines
- **After**: 11 skill-section files, ~4,000 lines
- **Reduction**: Deleted 12,316 lines, added 729 lines

### Build Status

✅ **ESM Build**: Working (90.68 KB)
✅ **TypeScript Declarations**: Working (11.86 KB)
✅ **Source Maps**: Working (134.71 KB)

Build with: `pnpm build` (requires dependencies to be built first)

### Dependencies

```json
{
  "@almadar/core": "workspace:*",      // Types, schemas
  "@almadar/patterns": "workspace:*",  // Pattern registry + helpers
  "@almadar/std": "workspace:*"        // Standard library behaviors
}
```

### Helper Functions Added

**In @almadar/patterns:**
- `getPatternsGroupedByCategory()` - Group patterns by category
- `getPatternPropsCompact()` - Generate compact props table
- `getPatternActionsRef()` - Generate action props reference
- `generatePatternDescription()` - Auto-generate from metadata

**In @almadar/skills:**
- `helpers.ts` - Generate prompts from @almadar/std and @almadar/core

### Remaining TODOs

1. ~~Fix TypeScript declaration generation~~ ✅ **DONE**
2. ~~Add CLI scripts for skill management~~ ✅ **DONE**
3. Test all 5 skills generate correctly from builder
4. Add comprehensive tests for skill generation

### Build Notes

- Run `pnpm build --filter "@almadar/skills"` from workspace root for best results
- Direct `pnpm build` in package directory also works once dependencies are built
- TypeScript declarations successfully generate with proper workspace dependency resolution

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm build` | Build the package (ESM + TypeScript declarations) |
| `pnpm build:watch` | Build in watch mode |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm generate` | Generate all skills to `.skills/` directory |
| `pnpm generate:list` | List all available skills |
| `pnpm generate:preview NAME` | Preview a specific skill |
| `pnpm install:skills` | Install skills to `~/.deepagents/kflow/skills/` |
| `pnpm install:check` | Check installation status |
| `pnpm install:clean` | Clean and reinstall skills |
| `pnpm validate` | Validate all generated skills |
| `pnpm sync` | Sync skills to builder (monorepo only) |
| `pnpm sync:dry` | Dry run sync (show what would change) |
| `pnpm clean` | Remove generated files and build output |

## Workflow Examples

### Generate and Install Skills Locally

```bash
cd packages/almadar-skills
pnpm build
pnpm generate
pnpm install:skills
```

### Development Workflow (Monorepo)

```bash
# Make changes to skill-sections or generators
pnpm build
pnpm generate
pnpm validate

# Sync to builder for testing
pnpm sync

# Check what would be synced first
pnpm sync:dry
```

### Check Installed Skills

```bash
pnpm install:check
```

Output:
```
🔍 Checking installation...

✅ Directories exist
   /Users/you/.deepagents/kflow/skills

📚 Installed skills (5):
   ✅ kflow-orbitals
   ✅ kflow-orbital-fixing
   ✅ kflow-lean-orbitals
   ✅ kflow-lean-fixing
   ✅ domain-language
```

## Dependencies

- `@almadar/core` - Core schema types
- `@almadar/patterns` - Pattern registry
- `@almadar/std` - Standard library

## License

MIT
