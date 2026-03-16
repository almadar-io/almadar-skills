/**
 * Domain Behavior Mapping Section
 *
 * Static mapping of application domains to recommended standard behaviors.
 * Helps the agent select appropriate behaviors for a given use case.
 *
 * @packageDocumentation
 */

/**
 * Generate the domain-to-behavior mapping guide.
 */
export function getDomainBehaviorMapping(): string {
    return `## Domain to Behavior Mapping

Use this guide to select behaviors based on the application domain.

| Domain | Recommended Behaviors |
|--------|----------------------|
| **Business CRUD** | std-list, std-detail |
| **E-commerce** | std-list (products), std-cart, std-wizard (checkout) |
| **Healthcare** | std-list (patients), std-wizard (intake), std-display (vitals) |
| **Education** | std-list (courses), std-wizard (enrollment) |
| **Gaming** | std-gameflow, std-combat, std-inventory-panel, std-quest |
| **Dashboard/Analytics** | std-display, std-list |
| **Social** | std-list (posts), std-messaging, std-detail (profile) |
| **DevOps** | std-list, std-display, std-circuit-breaker |
| **Finance** | std-list (transactions), std-display (portfolio), std-wizard (transfers) |
| **IoT/Monitoring** | std-display (sensors), std-list (devices), std-timer (polling) |
| **Content Management** | std-list (articles), std-detail (editor), std-tabs (categories) |
| **Booking/Scheduling** | std-list (slots), std-wizard (booking flow), std-confirmation |
| **Project Management** | std-list (tasks), std-detail (task view), std-tabs (boards) |

### Selection Strategy
1. Identify the primary entity types in the application
2. Match each entity to a behavior based on how users interact with it
3. Wire behaviors together using emits/listens for cross-entity communication
4. Use layout strategy (sidebar, tabs, dashboard) based on the relationship between entities`;
}
