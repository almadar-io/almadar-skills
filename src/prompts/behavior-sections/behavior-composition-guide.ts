/**
 * Behavior Composition Guide Section
 *
 * Static content explaining how to compose behaviors into applications.
 * Covers use_behavior, composeBehaviors, layout strategies, and event wiring.
 *
 * @packageDocumentation
 */

/**
 * Generate the behavior composition guide.
 */
export function getBehaviorCompositionGuide(): string {
    return `## Behavior Composition Guide

### Core Rule: One Entity Per Orbital
Every orbital has exactly ONE entity. If your app needs multiple entity types (e.g., Products and Orders),
create multiple orbitals and wire them together with events.

### How \`use_behavior\` Works
Call \`use_behavior\` with an entity name and its fields to instantiate a standard behavior.
The behavior function replaces generic field names with your entity-specific names and returns a complete orbital.

\`\`\`
use_behavior({ behavior: "std-list", entityName: "Product", fields: ["name", "price", "category"] })
// Returns: complete orbital with entity=Product, all states/events/UI wired for Product
\`\`\`

### How \`composeBehaviors\` Works
After instantiating individual behaviors, compose them into a full application.
\`composeBehaviors\` takes an array of orbitals and adds:
- Layout: how orbitals are arranged on screen
- Wiring: event connections between orbitals (emits/listens)
- Pages: route configuration

\`\`\`
compose_behaviors({
  orbitals: [productOrbital, orderOrbital],
  layout: "sidebar",
  wiring: [{ from: "ProductInteraction", event: "ADD_TO_CART", to: "OrderInteraction", triggers: "REFRESH" }]
})
\`\`\`

### Layout Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| \`sidebar\` | Navigation sidebar + main content | CRUD apps, dashboards |
| \`tabs\` | Tabbed content sections | Multi-entity views |
| \`dashboard\` | Grid of widgets/cards | Analytics, monitoring |
| \`wizard-flow\` | Sequential step-by-step | Onboarding, checkout |
| \`auto\` | Let the system choose based on orbital count | Quick prototyping |

### Event Wiring
Behaviors communicate through emits/listens. When one behavior emits an event,
another behavior's listener triggers a transition.

- **emits**: Events this behavior sends out (e.g., ITEM_CREATED, ADD_TO_CART)
- **listens**: Events this behavior responds to (e.g., REFRESH, ITEM_SELECTED)
- **wiring**: Explicit connections between behaviors: \`{ from, event, to, triggers }\`

Every \`emits\` declaration must have a matching \`listens\` in another trait.`;
}
