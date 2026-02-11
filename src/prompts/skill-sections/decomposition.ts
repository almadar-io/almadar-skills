/**
 * Decomposition Protocol Section
 *
 * Step-by-step protocol for breaking requirements into orbital units.
 * Keep this focused on the decision process, not verbose explanations.
 *
 * @packageDocumentation
 */

/**
 * Get the decomposition protocol section.
 */
export function getDecompositionSection(): string {
    return `## Orbital Decomposition Protocol

### Step 0: Classify Domain
| Domain | Keywords | Key Traits |
|--------|----------|------------|
| business | manage, track, workflow | EntityManagement, SearchAndFilter |
| game | play, score, level | Physics2D, Health, GameState |
| form | wizard, onboarding | Wizard, FormSubmission |
| dashboard | metrics, KPI | EntityManagement |
| content | blog, CMS | none (page navigation) |

### Step 1: Identify Entities (ONE Orbital Per Entity)
- What are the core data objects?
- persistent (DB), runtime (memory), or singleton (config)?
- **CRITICAL: Create exactly ONE orbital per entity** - do NOT split CRUD operations into separate orbitals

### Step 2: Select Interaction Model
| Domain | Create | View | Edit | Delete |
|--------|--------|------|------|--------|
| business | modal | drawer | modal | confirm |
| game | none | none | none | none |
| form | wizard | drawer | page | confirm |

### Step 3: Choose Traits
- Business: EntityManagement (handles CRUD via render-ui)
- Game: Physics2D, Health, Score, Collision
- Form: Wizard (multi-step) or FormSubmission (single)

### Step 4: Define State Machine
\`\`\`
states: Identify user-facing modes (browsing, creating, editing, viewing)
events: Identify user actions (INIT, CREATE, VIEW, EDIT, SAVE, CLOSE)
transitions: Map (from, event) → (to, effects)
\`\`\`

### Step 5: Add INIT Transition (CRITICAL)
Every trait MUST have:
\`\`\`json
{ "from": "initial", "to": "initial", "event": "INIT", "effects": [["render-ui", ...]] }
\`\`\`
Without INIT, the page loads blank!

### Step 6: Define Pages
- ONE page per entity (business) or workflow (form)
- Attach traits to pages via \`traits\` array
- No \`sections\` array - UI comes from render-ui effects

### Step 7: Add Guards (CRITICAL for Business Rules)

**Guards enforce business rules as S-expressions on transitions.**

#### When to use guards:
1. **Business rule validation** - Enforce constraints on SAVE transitions
2. **Conditional routing** - Same (from, event) leads to different states

#### Business Rule Guards (on SAVE):
\`\`\`json
{
  "from": "Editing", "to": "Browsing", "event": "SAVE",
  "guard": ["and",
    ["<=", "@payload.data.age", 120],
    [">=", "@payload.data.balance", 0]
  ],
  "effects": [["persist", "update", "Account", "@payload.data"], ...]
}
\`\`\`

#### Conditional Routing Guards:
\`\`\`json
{ "from": "A", "to": "B", "event": "X", "guard": [">", "@entity.health", 0] }
{ "from": "A", "to": "C", "event": "X", "guard": ["<=", "@entity.health", 0] }
\`\`\`

**IMPORTANT**:
- Use \`"guard"\` (singular) on transitions, NOT \`"guards"\` (plural)
- Business rules MUST be S-expression guards on the transition, NOT just UI messages!
`;
}

/**
 * Get minimal decomposition checklist.
 */
export function getDecompositionChecklist(): string {
    return `## Decomposition Checklist

- [ ] Domain classified (business/game/form/dashboard/content)
- [ ] Entities identified with persistence type
- [ ] **ONE orbital per entity** (not multiple orbitals for same entity!)
- [ ] Traits selected (EntityManagement for CRUD, domain-specific for others)
- [ ] State machine has states, events, transitions
- [ ] INIT transition exists with render-ui effects
- [ ] Pages defined (ONE per entity/workflow)
- [ ] Traits attached to pages
- [ ] **Business rule guards as S-expressions on SAVE transitions**
- [ ] Entity relations defined for cross-orbital links
- [ ] emits/listens defined for cross-orbital events
`;
}

/**
 * Get compact decomposition protocol (~1,250 chars).
 * Steps 0-6 without verbose guard examples (guards covered in S-Expr + errors).
 */
export function getDecompositionCompact(): string {
    return `## Orbital Decomposition Protocol

### Step 0: Classify Domain
| Domain | Keywords | Key Traits |
|--------|----------|------------|
| business | manage, track, workflow | EntityManagement, SearchAndFilter |
| game | play, score, level | Physics2D, Health, GameState |
| form | wizard, onboarding | Wizard, FormSubmission |
| dashboard | metrics, KPI | EntityManagement |
| content | blog, CMS | none (page navigation) |

### Step 1: Identify Entities (ONE Orbital Per Entity)
- What are the core data objects?
- persistent (DB), runtime (memory), or singleton (config)?
- **CRITICAL: Create exactly ONE orbital per entity**

### Step 2: Select Interaction Model
| Domain | Create | View | Edit | Delete |
|--------|--------|------|------|--------|
| business | modal | drawer | modal | confirm |
| game | none | none | none | none |
| form | wizard | drawer | page | confirm |

### Step 3: Choose Traits
- Business: EntityManagement (handles CRUD via render-ui)
- Game: Physics2D, Health, Score, Collision
- Form: Wizard (multi-step) or FormSubmission (single)

### Step 4: Define State Machine
\`\`\`
states: Identify user-facing modes (browsing, creating, editing, viewing)
events: Identify user actions (INIT, CREATE, VIEW, EDIT, SAVE, CLOSE)
transitions: Map (from, event) → (to, effects)
\`\`\`

### Step 5: Add INIT Transition (CRITICAL)
Every trait MUST have an INIT self-loop with render-ui effects. Without INIT, the page loads blank!

### Step 6: Define Pages
- ONE page per entity (business) or workflow (form)
- Attach traits to pages via \`traits\` array
- Add \`"guard"\` (singular) S-expressions on SAVE transitions for business rules
`;
}

/**
 * Get compact orbital connectivity (~750 chars).
 * One combined example instead of three separate examples.
 */
export function getConnectivityCompact(): string {
    return `## Orbital Connectivity

For multi-entity apps, connect orbitals:

\`\`\`json
{
  "entity": {
    "fields": [
      { "name": "customerId", "type": "relation", "relation": { "entity": "Customer", "cardinality": "one" } }
    ]
  },
  "emits": ["ORDER_COMPLETED"],
  "listens": [{ "event": "MENU_ITEM_UNAVAILABLE", "triggers": "DISABLE_ITEM" }],
  "design": {
    "uxHints": {
      "relatedLinks": [{ "relation": "customerId", "label": "View Customer", "targetView": "detail" }]
    }
  }
}
\`\`\`

- **relation fields**: Link entities (Order → Customer)
- **emits/listens**: Cross-orbital event communication
- **relatedLinks**: Navigation between related records
`;
}

// ============================================================================
// UX Enhancement Sections
// ============================================================================

/**
 * Get flow pattern selection guidance.
 * Maps application types to appropriate user flow patterns.
 */
export function getFlowPatternSection(): string {
    return `## Flow Pattern Selection

Select a flow pattern based on application type:

| App Type | Flow Pattern | Structure |
|----------|--------------|-----------|
| Dashboard/Admin | hub-spoke | Central hub → feature pages → back to hub |
| CRM/List-focused | master-detail | List with drill-down drawer or split view |
| CRUD App | crud-cycle | List ↔ modal forms for create/edit |
| Onboarding/Checkout | linear | Step-by-step wizard flow |
| Multi-role | role-based | Role guards determine visible features |

**Flow → Orbital Structure:**
- hub-spoke: Dashboard orbital + feature orbitals with navigation
- master-detail: Entity orbital with detail drawer state
- crud-cycle: Entity orbital with modal form states
- linear: Step orbitals connected via navigation
- role-based: Shared orbitals with role-based guards
`;
}

/**
 * Get guidance for outputting orbitals with embedded context.
 */
export function getPortableOrbitalOutputSection(): string {
    return `## Orbital Output Format

Each orbital MUST include embedded context for portability:

\`\`\`json
{
  "name": "Order Management",
  "entity": {
    "name": "Order",
    "persistence": "persistent",
    "fields": [
      { "name": "customerId", "type": "relation", "relation": { "entity": "Customer", "cardinality": "one" } },
      { "name": "items", "type": "relation", "relation": { "entity": "MenuItem", "cardinality": "many" } }
    ]
  },
  "traits": ["EntityManagement"],
  "domainContext": {
    "request": "<full user request>",
    "requestFragment": "<verbatim excerpt for THIS orbital>",
    "category": "business",
    "vocabulary": { "item": "Order", "create": "Place Order", "delete": "Cancel" }
  },
  "design": {
    "style": "modern",
    "uxHints": { "flowPattern": "crud-cycle", "listPattern": "entity-table", "formPattern": "modal" }
  },
  "emits": ["ORDER_READY", "ORDER_COMPLETED"],
  "listens": [{ "event": "MENU_ITEM_UNAVAILABLE", "triggers": "DISABLE_ITEM" }],
  "relations": [
    { "entity": "Customer", "cardinality": "one" },
    { "entity": "MenuItem", "cardinality": "many" }
  ]
}
\`\`\`

**Required context fields:**
- \`domainContext.requestFragment\` - What user said that produced this orbital
- \`domainContext.category\` - Domain classification
- \`domainContext.vocabulary\` - Domain-specific naming
- \`design.uxHints\` - Pattern selection hints

**Cross-orbital connectivity (for multi-entity apps):**
- \`entity.fields[].relation\` - Link to related entities
- \`emits\` - Events this orbital emits when state changes
- \`listens\` - Events from other orbitals to handle
- \`relations\` - Summary of entity relationships
`;
}

/**
 * Get guidance for connecting orbitals together.
 */
export function getOrbitalConnectivitySection(): string {
    return `## Orbital Connectivity (CRITICAL)

Orbitals must NOT be discrete islands. For multi-entity apps, connect orbitals properly:

### 1. Entity Relations (REQUIRED for related entities)
When Entity A references Entity B, add a relation field:
\`\`\`json
// In Order orbital's entity.fields:
{ "name": "customerId", "type": "relation", "relation": { "entity": "Customer", "cardinality": "one" } }
{ "name": "items", "type": "relation", "relation": { "entity": "MenuItem", "cardinality": "many" } }
\`\`\`

### 2. Navigation Links (in design.uxHints.relatedLinks)
Enable drill-down from one orbital to another:
\`\`\`json
{ "relatedLinks": [{ "relation": "customerId", "label": "View Customer", "targetView": "detail" }] }
\`\`\`

### 3. Cross-Orbital Events (emits/listens)
Orbitals communicate via events:
\`\`\`json
// Order orbital emits when status changes:
{ "emits": ["ORDER_READY", "ORDER_COMPLETED"] }

// Notification orbital listens:
{ "listens": [{ "event": "ORDER_READY", "triggers": "NOTIFY_CUSTOMER" }] }
\`\`\`

**CRITICAL: For multi-entity apps:**
- Add relation fields to connect entities (e.g., Order → Customer, Order → MenuItem)
- Add emits/listens when one orbital's state change affects another
- Add relatedLinks for navigation between related records
`;
}
