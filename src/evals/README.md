# Composition Quality Evaluations

> Automated evaluation framework for assessing LLM providers' ability to generate sophisticated render-ui effects.

## Overview

This evaluation framework tests providers against the **Five Rules of Sophisticated Composition**:

1. **Single Render-UI** per transition
2. **Three Atomic Levels**: Atoms (2+) + Molecules (1+) + Organisms (1+)
3. **Layout Wrapper**: Root must be stack/box/container/grid
4. **Theme Variables**: ALL visual props use CSS vars
5. **Template Quality**: Match CrudTemplate/ListTemplate sophistication

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Eval Runner                             │
│              (uses @almadar/llm client)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Claude     │ │    GPT-4     │ │   Gemini     │
│  (Sonnet)    │ │   (Turbo)    │ │   (Pro)      │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
           ┌────────────────────────┐
           │  Generated Schemas     │
           │  (saved to results/)   │
           └───────────┬────────────┘
                       ▼
           ┌────────────────────────┐
           │  Composition Scorer    │
           │  (composition-quality  │
           │   scoring functions)   │
           └───────────┬────────────┘
                       ▼
           ┌────────────────────────┐
           │  Comparison Matrix     │
           │  (markdown report)     │
           └────────────────────────┘
```

## Scoring System (0-100)

| Category | Points | Criteria |
|----------|--------|----------|
| **Structure** | 25 | Single render-ui, layout root, proper nesting, validation, closed circuit |
| **Composition** | 25 | Atoms (2+), Molecules (1+), Organisms (1+) |
| **Theme** | 25 | Theme variable usage (90%+), no hardcoded values |
| **Quality** | 25 | Multiple sections (3+), expected patterns, domain appropriateness |

## Grade Scale

- **90-100**: Excellent (Template-quality)
- **75-89**: Good (Minor improvements needed)
- **50-74**: Acceptable (Major gaps)
- **0-49**: Poor (Does not meet standards)

## Test Cases

| Case | Domain | Min Score | Description |
|------|--------|-----------|-------------|
| task-management-basic | general | 70 | Basic CRUD with stats |
| patient-portal-dashboard | healthcare | 75 | Dashboard with tabs |
| ecommerce-product-catalog | ecommerce | 75 | Grid layout with cards |

## Running Evaluations

### Prerequisites

The eval runner uses `@almadar/llm` for provider access. Set up your API keys:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export DEEPSEEK_API_KEY="sk-..."
```

### Run All Eval Cases Against a Provider

```bash
# Run with Claude 3.5 Sonnet
npx tsx evals/runner.ts --provider anthropic --model claude-3-5-sonnet-20241022

# Run with GPT-4 Turbo
npx tsx evals/runner.ts --provider openai --model gpt-4-turbo-preview

# Run with DeepSeek
npx tsx evals/runner.ts --provider deepseek --model deepseek-chat
```

### Run Specific Test Case

```bash
npx tsx evals/runner.ts \
  --provider anthropic \
  --model claude-3-5-sonnet-20241022 \
  --case task-management-basic
```

### Generate Comparison Matrix

```bash
# Run all providers and compare
npx tsx evals/runner.ts --compare-all

# This generates:
# - results/comparison-matrix.md
# - results/<provider>-<model>-results.json
```

## File Structure

```
evals/
├── composition-quality.ts    # Core scoring framework
├── runner.ts                 # Evaluation runner CLI
├── cases/
│   ├── task-management.json  # Test case definitions
│   ├── patient-portal.json
│   └── ecommerce-catalog.json
├── results/                  # Generated results (gitignored)
│   ├── comparison-matrix.md
│   ├── claude-sonnet-results.json
│   └── gpt-4-turbo-results.json
└── README.md
```

## Using @almadar/llm

The eval runner integrates with `@almadar/llm` for provider access:

```typescript
import { getSharedLLMClient, LLMProvider } from '@almadar/llm';

const client = getSharedLLMClient({
  provider: 'anthropic' as LLMProvider,
  model: 'claude-3-5-sonnet-20241022',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.complete({
  messages: [
    { role: 'system', content: skillContent },
    { role: 'user', content: testCase.prompt }
  ],
  temperature: 0.7,
});

const schema = extractSchema(response.content);
const score = calculateTotalScore(schema, testCase, []);
```

## Provider Comparison Matrix

Run `npx tsx evals/runner.ts --compare-all` to generate:

| Provider | Model | Average | task-mgmt | patient | ecommerce |
|----------|-------|---------|-----------|---------|-----------|
| Claude | claude-3-5-sonnet | ? | ? | ? | ? |
| OpenAI | gpt-4-turbo | ? | ? | ? | ? |
| OpenAI | gpt-4o | ? | ? | ? | ? |
| DeepSeek | deepseek-chat | ? | ? | ? | ? |

## Implementation Status

- [x] Core scoring framework
- [x] Test cases defined
- [x] Provider comparison matrix structure
- [ ] Eval runner CLI implementation
- [ ] Integration with `@almadar/llm`
- [ ] Results persistence
- [ ] CI/CD integration

## Why No Separate Provider Adapters?

We use `@almadar/llm` directly because it already provides:

- Multi-provider support (Anthropic, OpenAI, DeepSeek, Kimi)
- Rate limiting and token tracking
- Structured output handling
- Continuation support
- Error handling and retries

The eval framework focuses on **scoring/analysis**, not provider abstraction.
