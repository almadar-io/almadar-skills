/**
 * Cross-Orbital Wiring Guide Section
 *
 * Static content explaining how events flow between orbitals
 * and common wiring patterns for behavior composition.
 *
 * @packageDocumentation
 */

/**
 * Generate the cross-orbital wiring guide.
 */
export function getCrossOrbitalWiringGuide(): string {
    return `## Cross-Orbital Wiring Guide

### How Events Flow Between Orbitals
Orbitals communicate through a shared event bus. One orbital's trait emits an event,
and another orbital's trait listens for it. The listener triggers a local transition.

### Wiring Format
\`\`\`json
{
  "from": "ProductInteraction",
  "event": "ADD_TO_CART",
  "to": "CartInteraction",
  "triggers": "REFRESH"
}
\`\`\`

- **from**: The trait that emits the event
- **event**: The event name being emitted
- **to**: The trait that listens for the event
- **triggers**: The local event triggered in the listening trait

### Common Wiring Patterns

#### CRUD Refresh
When one orbital creates/updates/deletes, another orbital refreshes its list.

\`\`\`
ProductInteraction emits PRODUCT_CREATED
  -> OrderInteraction listens PRODUCT_CREATED, triggers REFRESH
\`\`\`

#### Navigation / Detail View
When one orbital selects an item, another shows its details.

\`\`\`
ListInteraction emits VIEW_DETAIL
  -> DetailInteraction listens VIEW_DETAIL, triggers INIT
\`\`\`

#### Cart Pattern
Add-to-cart from a product list updates the cart orbital.

\`\`\`
ProductInteraction emits ADD_TO_CART
  -> CartInteraction listens ADD_TO_CART, triggers ITEM_ADDED
\`\`\`

#### Wizard Completion
A multi-step wizard emits completion, triggering a downstream action.

\`\`\`
CheckoutInteraction emits ORDER_PLACED
  -> ConfirmationInteraction listens ORDER_PLACED, triggers INIT
\`\`\`

### Rules
1. Every \`emits\` must have a matching \`listens\` in another trait
2. Event names should be descriptive: ENTITY_ACTION (e.g., PRODUCT_CREATED, ORDER_PLACED)
3. The \`triggers\` field is a local event name in the listening trait's state machine
4. Multiple traits can listen to the same event
5. A trait can emit to multiple listeners`;
}
