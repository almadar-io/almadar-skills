/**
 * Game Guidance Section
 *
 * Specialized guidance for generating game orbital schemas.
 *
 * @packageDocumentation
 */

/**
 * Get the game as orbitals composition section.
 */
export function getGameAsOrbitalsSection(): string {
    return `## Games as Orbital Composition

A game is a **list of orbitals**, each representing a game element:

\`\`\`
Game Application = Σ(Game Orbitals)

├── Player Orbital (runtime entity + input/physics traits)
├── Enemy Orbital (runtime entity + AI/physics traits)
├── Item Orbital (runtime entity + collectible trait)
├── Level Orbital (singleton entity + level loader trait)
└── GameState Orbital (singleton + score/health traits)
\`\`\`

### Persistence Types for Games

| Type | Use Case | Example |
|------|----------|---------|
| \`runtime: true\` | Active game objects | Player, Enemy, Bullet |
| \`singleton: true\` | Global state | GameConfig, LevelState |
| \`collection: "..."\` | Saved data | HighScores, SavedGames |`;
}

/**
 * Get game entity templates section.
 */
export function getGameEntityTemplatesSection(): string {
    return `## Game Entity Templates

### Player Entity (runtime)

\`\`\`json
{
  "name": "Player",
  "runtime": true,
  "fields": [
    { "name": "x", "type": "number", "default": 100 },
    { "name": "y", "type": "number", "default": 100 },
    { "name": "velocityX", "type": "number", "default": 0 },
    { "name": "velocityY", "type": "number", "default": 0 },
    { "name": "health", "type": "number", "default": 100 },
    { "name": "facing", "type": "enum", "values": ["left", "right"], "default": "right" }
  ]
}
\`\`\`

### GameState Entity (singleton)

\`\`\`json
{
  "name": "GameState",
  "singleton": true,
  "fields": [
    { "name": "score", "type": "number", "default": 0 },
    { "name": "level", "type": "number", "default": 1 },
    { "name": "lives", "type": "number", "default": 3 },
    { "name": "state", "type": "enum", "values": ["menu", "playing", "paused", "gameOver"] }
  ]
}
\`\`\`

### Enemy Entity (runtime)

\`\`\`json
{
  "name": "Enemy",
  "runtime": true,
  "fields": [
    { "name": "x", "type": "number" },
    { "name": "y", "type": "number" },
    { "name": "health", "type": "number", "default": 30 },
    { "name": "damage", "type": "number", "default": 10 },
    { "name": "patrolStart", "type": "number" },
    { "name": "patrolEnd", "type": "number" }
  ]
}
\`\`\``;
}

/**
 * Get game traits section.
 */
export function getGameTraitsSection(): string {
    return `## Game Traits

### Core Game Traits

| Trait | Purpose | Key States |
|-------|---------|------------|
| \`Physics2D\` | Gravity, velocity | grounded, airborne, falling |
| \`PlatformerInput\` | Movement controls | idle, moving, jumping |
| \`Health\` | Damage, death | alive, hurt, dead |
| \`Score\` | Points tracking | (stateless - just effects) |
| \`Collectible\` | Pickup items | available, collected |
| \`Patrol\` | Enemy AI | patrolling, reversing |
| \`GameState\` | Game flow | menu, playing, paused, gameOver |

### Game Trait Example

\`\`\`json
{
  "name": "Physics2D",
  "category": "interaction",
  "linkedEntity": "Player",
  "stateMachine": {
    "states": [
      { "name": "grounded", "isInitial": true },
      { "name": "airborne" }
    ],
    "events": [
      { "key": "JUMP", "name": "Jump" },
      { "key": "LAND", "name": "Land" }
    ],
    "transitions": [
      {
        "from": "grounded",
        "to": "airborne",
        "event": "JUMP",
        "effects": [
          ["set", "@entity.velocityY", -15],
          ["emit", "PLAYER_JUMPED", "@entity"]
        ]
      },
      {
        "from": "airborne",
        "to": "grounded",
        "event": "LAND",
        "effects": [
          ["set", "@entity.velocityY", 0],
          ["set", "@entity.isGrounded", true]
        ]
      }
    ]
  }
}
\`\`\``;
}

/**
 * Get game patterns section.
 */
export function getGamePatternsSection(): string {
    return `## Game UI Patterns

| Pattern | Slot | Purpose |
|---------|------|---------|
| \`game-canvas\` | main | Main game rendering |
| \`game-hud\` | overlay | Score, health, lives |
| \`game-controls\` | overlay | Touch/keyboard hints |
| \`game-menu\` | modal | Pause, settings |

### Game Canvas Effect

\`\`\`json
["render-ui", "main", {
  "type": "game-canvas",
  "entities": ["Player", "Enemy", "Coin", "Platform"],
  "camera": { "follow": "Player" },
  "physics": { "gravity": 980 }
}]
\`\`\`

### Game HUD Effect

\`\`\`json
["render-ui", "overlay", {
  "type": "game-hud",
  "elements": [
    { "type": "health-bar", "entity": "Player", "field": "health" },
    { "type": "score-display", "entity": "GameState", "field": "score" },
    { "type": "lives-counter", "entity": "GameState", "field": "lives" }
  ]
}]
\`\`\``;
}

/**
 * Get asset reference section.
 */
export function getAssetRefSection(): string {
    return `## Asset References

**NEVER hardcode asset paths. Use assetRef:**

\`\`\`json
{
  "entity": {
    "name": "Player",
    "assetRef": {
      "role": "player",
      "category": "hero",
      "animations": ["idle", "run", "jump", "fall", "hurt"],
      "style": "pixel"
    }
  }
}
\`\`\`

The compiler resolves \`assetRef\` to actual sprite paths at build time.

### Animation Mapping

| State | Animation |
|-------|-----------|
| grounded + idle | \`idle\` |
| grounded + moving | \`run\` |
| airborne + velocityY < 0 | \`jump\` |
| airborne + velocityY > 0 | \`fall\` |
| taking damage | \`hurt\` |
| health <= 0 | \`die\` |`;
}

/**
 * Get multi-file composition section.
 */
export function getMultiFileSection(): string {
    return `## Multi-File Composition

Split large games into multiple .orb files:

\`\`\`
game/
├── game.orb          # Main schema with Player, GameState
├── enemies.orb       # Enemy orbital definitions
├── items.orb         # Collectibles, powerups
└── tiles.orb         # Platforms, terrain
\`\`\`

### External Reference Syntax

\`\`\`json
{
  "name": "Level1Enemies",
  "ref": "./enemies.orb#Slime",
  "instances": [
    { "id": "slime-1", "position": { "x": 300, "y": 400 } },
    { "id": "slime-2", "position": { "x": 600, "y": 400 } }
  ]
}
\`\`\``;
}

/**
 * Get game types section.
 */
export function getGameTypesSection(): string {
    return `## Game Type Templates

### Platformer
- Player with Physics2D + PlatformerInput
- Platform entities for level layout
- Collectible coins/items
- Enemies with Patrol trait

### Puzzle (Match-3, Tetris)
- Grid-based entity (runtime singleton)
- Tile/Piece entities
- Match detection logic in trait
- Score tracking

### Roguelike
- Player with Health + Inventory
- Dungeon/Room singleton for level gen
- Enemy entities with AI traits
- Turn-based or real-time movement

### Endless Runner
- Player at fixed X, jumping
- Obstacles spawning and moving
- Procedural difficulty scaling
- Distance-based scoring`;
}
