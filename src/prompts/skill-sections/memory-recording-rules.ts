/**
 * Memory Recording Rules
 *
 * Tells the agent when and how to use memory tools.
 * Injected into the system prompt when memory tools are available.
 */

export function getMemoryRecordingRules(): string {
  return `## Memory Recording Rules

You have memory tools. Use them to learn from every session.

### WHEN TO RECORD
- **User corrects you** ("no, use data-grid not data-list") → call \`write_error_resolution\` with the correction. If they say "always" or "never", the memory will be pinned (never forgotten).
- **Generation succeeds** (validate passes, compile works) → call \`record_entity_template\` with the orbital structure that worked: entity name, fields, trait names, behavior match, patterns used.
- **User gives explicit feedback** ("good", "that's what I wanted") → reinforces the patterns used in this session automatically.

### WHEN TO RECALL
- At session start, relevant memories are already in your system prompt.
- **Before \`select_behaviors\`**: call \`search_entity_templates\` to find similar past orbitals for the same domain. If you've built something similar before, reuse the structure.
- **Before \`update_render_ui\`**: call \`search_memory\` to check if the user has preferences about UI patterns (e.g., "always use data-grid for tables").

### WHAT NOT TO RECORD
- Don't record the full schema (it's in the .orb file on disk).
- Don't record tool output (it's in the trace).
- Don't record conversation text (it's in the session).
- Record **WHY** something worked, not **WHAT** was generated.
- Record the **pattern** ("healthcare apps need phoneNumber on patient entities"), not the **instance** ("Patient entity has fields id, fullName, email, phoneNumber").

### MEMORY STRENGTH
Memories have strength (0-1). Strong memories persist, weak ones fade.
- New memories start at 0.5
- Each time a memory is used, it gets stronger (+10%)
- Unused memories decay over time (-1% per day)
- Pinned memories never decay (user said "always" or "never")
- Memories below 0.1 strength are forgotten (not shown to you)
`;
}
