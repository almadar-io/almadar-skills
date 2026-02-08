/**
 * Custom Trait Guidance Section
 *
 * Comprehensive guidance for creating custom traits.
 * Part of the lean orbital skill.
 *
 * @packageDocumentation
 */

/**
 * Get the custom trait guidance section.
 */
export function getCustomTraitSection(): string {
  return `## Custom Trait Guide

### When to Create Custom Traits

| Scenario | Approach |
|----------|----------|
| Standard CRUD list/view/edit | Use \`std/List\` behavior pattern |
| Multi-step wizard | Custom trait with states = steps |
| Approval workflow | Custom trait (Drafting \u2192 InReview \u2192 Published) |
| Payment processing | Custom \`integration\` trait with call-service |
| Domain-specific workflow | Custom trait matching business states |

### Trait Categories

| Category | Purpose | Requires render-ui? |
|----------|---------|---------------------|
| \`interaction\` | UI state machine | **YES** - must render UI |
| \`integration\` | Backend service calls | No |

### Interaction Trait Requirements (CRITICAL)

Every \`interaction\` trait MUST have:
1. **States as objects** with \`isInitial\` flag
2. **INIT transition** (self-loop on initial state) that renders UI
3. **render-ui effects** for every state transition
4. **form-section with onSubmit** to connect forms to events

### Example: Document Publishing Workflow

\`\`\`json
{
  "name": "DocumentPublishing",
  "category": "interaction",
  "linkedEntity": "Document",
  "stateMachine": {
    "states": [
      { "name": "Drafting", "isInitial": true },
      { "name": "InReview" },
      { "name": "Published" }
    ],
    "events": [
      { "key": "INIT" },
      { "key": "SUBMIT" },
      { "key": "APPROVE" },
      { "key": "REJECT" }
    ],
    "transitions": [
      {
        "from": "Drafting",
        "to": "Drafting",
        "event": "INIT",
        "effects": [
          ["render-ui", "main", {
            "type": "page-header",
            "title": "Edit Document",
            "actions": [{ "label": "Submit", "event": "SUBMIT" }]
          }],
          ["render-ui", "main", {
            "type": "form-section",
            "entity": "Document",
            "fields": ["title", "content"],
            "onSubmit": "SUBMIT"
          }]
        ]
      },
      {
        "from": "Drafting",
        "to": "InReview",
        "event": "SUBMIT",
        "effects": [
          ["set", "@entity.status", "review"],
          ["persist", "update"],
          ["render-ui", "main", {
            "type": "page-header",
            "title": "In Review"
          }],
          ["render-ui", "main", {
            "type": "entity-detail",
            "entity": "Document",
            "fieldNames": ["title", "content"]
          }],
          ["render-ui", "main", {
            "type": "form-section",
            "submitLabel": "Approve",
            "cancelLabel": "Reject",
            "onSubmit": "APPROVE",
            "onCancel": "REJECT"
          }]
        ]
      },
      {
        "from": "InReview",
        "to": "Drafting",
        "event": "REJECT",
        "effects": [
          ["set", "@entity.status", "draft"],
          ["persist", "update"],
          ["emit", "INIT"]
        ]
      },
      {
        "from": "InReview",
        "to": "Published",
        "event": "APPROVE",
        "effects": [
          ["set", "@entity.status", "published"],
          ["set", "@entity.publishedAt", "@now"],
          ["persist", "update"],
          ["render-ui", "main", {
            "type": "page-header",
            "title": "Published!"
          }],
          ["render-ui", "main", {
            "type": "entity-detail",
            "entity": "Document"
          }]
        ]
      }
    ]
  }
}
\`\`\`

**Key Points:**
- INIT is a self-loop that renders the initial UI
- Every state transition has render-ui effects
- form-section always has onSubmit
- REJECT emits INIT to re-render Drafting state

### Example: Integration Trait (Payment)

\`\`\`json
{
  "name": "PaymentProcessing",
  "category": "integration",
  "linkedEntity": "Order",
  "emits": [
    {
      "event": "ORDER_PAID",
      "scope": "external",
      "description": "Emitted when payment succeeds",
      "payload": [
        { "name": "orderId", "type": "string", "required": true, "description": "The paid order ID" },
        { "name": "total", "type": "number", "required": true, "description": "Order total amount" }
      ]
    }
  ],
  "stateMachine": {
    "states": [
      { "name": "Pending", "isInitial": true },
      { "name": "Processing" },
      { "name": "Completed" },
      { "name": "Failed" }
    ],
    "events": [
      { "key": "PROCESS" },
      { "key": "SUCCESS" },
      { "key": "FAILURE" }
    ],
    "transitions": [
      {
        "from": "Pending",
        "to": "Processing",
        "event": "PROCESS",
        "effects": [
          ["call-service", "stripe", "charge", {
            "amount": "@entity.total",
            "onSuccess": "SUCCESS",
            "onError": "FAILURE"
          }]
        ]
      },
      {
        "from": "Processing",
        "to": "Completed",
        "event": "SUCCESS",
        "effects": [
          ["set", "@entity.paidAt", "@now"],
          ["persist", "update"],
          ["emit", "ORDER_PAID", { "orderId": "@entity.id", "total": "@entity.total" }]
        ]
      },
      {
        "from": "Processing",
        "to": "Failed",
        "event": "FAILURE",
        "effects": [
          ["notify", "Payment failed", "error"]
        ]
      }
    ]
  }
}
\`\`\`

**Note:** Integration traits don't need INIT or render-ui - they're triggered by events, not page load.

### Cross-Orbital Communication (CRITICAL)

When traits need to communicate across orbitals, you MUST:

1. **Declare emits with payload contract:**
\`\`\`json
"emits": [
  {
    "event": "ORDER_PAID",
    "scope": "external",
    "description": "Emitted when payment is confirmed",
    "payload": [
      { "name": "orderId", "type": "string", "required": true },
      { "name": "total", "type": "number", "required": true }
    ]
  }
]
\`\`\`

2. **Include payload data in emit effect:**
\`\`\`json
["emit", "ORDER_PAID", { "orderId": "@entity.id", "total": "@entity.total" }]
\`\`\`

3. **Declare listeners with payloadMapping:**
\`\`\`json
"listens": [
  {
    "event": "PaymentProcessing.ORDER_PAID",
    "scope": "external",
    "triggers": "SEND_RECEIPT",
    "payloadMapping": {
      "orderId": "@payload.orderId",
      "amount": "@payload.total"
    }
  }
]
\`\`\`

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Missing INIT | Page is blank | Add self-loop with render-ui |
| States as strings | Validation fails | Use \`{ "name": "...", "isInitial": true }\` |
| No render-ui | UI doesn't update | Add render-ui to every transition |
| form-section no onSubmit | Form does nothing | Add \`onSubmit: "EVENT"\` |
| **Using form-actions** | **Pattern doesn't exist!** | **Use form-section with onSubmit/onCancel** |
| Duplicate (from, event) | Second unreachable | Use guards or different events |
| from: '*' | Non-deterministic | Use explicit from state |
| **External emit no payload** | **Listeners have no data** | **Add payload array with typed fields** |
| **emit effect no data** | **Payload is empty at runtime** | **Pass payload object: \`["emit", "EVT", {...}]\`** |

### Pattern Action Props Quick Reference

| Pattern | Action Props | Purpose |
|---------|--------------|---------|
| \`page-header\` | \`actions: [{label, event}]\` | Top-right buttons (New, Export) |
| \`form-section\` | \`onSubmit\`, \`onCancel\` | Form submit/cancel buttons |
| \`entity-table\` | \`itemActions: [{label, event}]\` | Row action buttons (Edit, Delete) |
| \`entity-detail\` | \`headerActions: [{label, event}]\` | Detail view header buttons |
| \`confirmation\` | \`onConfirm\`, \`onCancel\` | Confirmation dialog buttons |
`;
}

/**
 * Get a compact version of custom trait guidance.
 */
export function getCustomTraitCompact(): string {
  return `## Custom Traits

**Interaction traits** (UI): MUST have INIT self-loop with render-ui
**Integration traits** (backend): call-service, no render-ui needed

States = \`{ "name": "...", "isInitial": true }\` (objects, not strings)
form-section = always include \`onSubmit: "EVENT"\`
`;
}
