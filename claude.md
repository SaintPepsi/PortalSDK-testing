# Portal SDK - Claude Code Documentation

## Project Overview

This is the **Battlefield Portal SDK**, a TypeScript-based development environment for creating custom game modes and scripting experiences for Battlefield Portal. The SDK allows developers to write custom game logic, handle player events, manage game state, and interact with Battlefield's game engine through a well-defined TypeScript API.

## Project Structure

```
PortalSDK/
├── mods/                          # Custom game mode implementations
│   ├── _StartHere_BasicTemplate/  # Tutorial template with common patterns
│   ├── BombSquad/                 # Example: Bomb defusal game mode
│   ├── Exfil/                     # Example: Extraction-based game mode
│   ├── Vertigo/                   # Example: Custom game mode
│   ├── AcePursuit/                # Example: Custom game mode
│   └── Testing/                   # Testing workspace
├── code/
│   ├── mod/
│   │   └── index.d.ts             # Core Portal API type definitions (14k+ lines)
│   ├── gdconverter/               # Godot scene converter utilities
│   └── gdplugins/                 # Godot editor plugins for Portal
├── package.json                   # Project dependencies and build scripts
├── tsconfig.json                  # TypeScript compiler configuration
└── vite.config.ts                 # Vite bundler configuration
```

## Core Technology Stack

- **TypeScript 5.3.3**: Primary development language with strict type checking
- **Vite 7.1+**: Build tool and bundler for fast development
- **Node.js 20.6.0**: Runtime environment
- **Target**: ES2020, ESNext modules
- **Godot Integration**: Level editor and scene management

## Build System

Available NPM scripts:
- `npm run build` - Build the project using Vite
- `npm run clean` - Remove dist directory
- `npm run rebuild` - Clean and build
- `npm run typecheck` - Run TypeScript type checking without emitting files

## Portal Scripting API

The Portal API is exposed through the `mod` namespace (defined in `code/mod/index.d.ts`). All game mode scripts import this namespace to interact with the game engine.

### Core Types

The API uses opaque types for type safety. Major types include:

**Game Objects:**
- `mod.Player` - Represents a player in the game
- `mod.Team` - Team assignment
- `mod.Squad` - Squad grouping
- `mod.Vehicle` - Vehicle instances
- `mod.CapturePoint` - Objective points
- `mod.InteractPoint` - Interactable objects
- `mod.AreaTrigger` - Spatial triggers for overlap events
- `mod.HQ` - Headquarters spawner
- `mod.Spawner` - AI/entity spawners
- `mod.Vector` - 3D vector for positions/rotations/colors

**Visual/Audio:**
- `mod.VFX` - Visual effects
- `mod.SFX` - Sound effects
- `mod.VO` - Voice overs
- `mod.ScreenEffect` - Screen post-processing effects
- `mod.WorldIcon` - 3D world-space UI icons
- `mod.UIWidget` - UI elements

**Weapons/Inventory:**
- `mod.WeaponUnlock` - Weapon definitions
- `mod.WeaponPackage` - Weapon loadouts
- `mod.SoldierKits` - Soldier class kits

**Spatial:**
- `mod.WaypointPath` - AI navigation paths
- `mod.SpatialObject` - Generic spatial objects
- `mod.Transform` - Transformation data

## Event-Driven Programming Model

Portal uses an event callback system. Export functions with specific names to handle events:

### Player Lifecycle Events

```typescript
// Called when a player joins the game
export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    // Initialize player state, assign teams, etc.
}

// Called when a player leaves the game
export function OnPlayerLeaveGame(eventNumber: number): void {
    // Cleanup logic, update team balance, etc.
}

// Called when player spawns into the game after class selection
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Spawn-specific logic, grant items, teleport, etc.
}
```

### Combat Events

```typescript
// Called when a player dies
export function OnPlayerDied(
    eventPlayer: mod.Player,        // The player who died
    eventOtherPlayer: mod.Player,   // The killer
    eventDeathType: mod.DeathType,  // How they died
    eventWeaponUnlock: mod.WeaponUnlock // Weapon used
): void {
    // Update scores, respawn logic, kill streak tracking
}

// Called when a player earns a kill
export function OnPlayerEarnedKill(
    eventPlayer: mod.Player,        // The killer
    eventOtherPlayer: mod.Player,   // The victim
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Award points, achievements, etc.
}

// Called when a player takes damage (but doesn't die)
export function OnPlayerDamaged(
    eventPlayer: mod.Player,        // Player taking damage
    eventOtherPlayer: mod.Player,   // Attacker
    eventDamageType: mod.DamageType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Custom damage logic, UI updates, etc.
}
```

### Interaction Events

```typescript
// Called when player interacts with an InteractPoint
export function OnPlayerInteract(
    eventPlayer: mod.Player,
    eventInteractPoint: mod.InteractPoint
): void {
    // Button presses, object pickup, checkpoint activation
    const interactId = mod.GetObjId(eventInteractPoint);
    // Handle based on ID
}

// Called when player enters a CapturePoint area
export function OnPlayerEnterCapturePoint(
    eventPlayer: mod.Player,
    eventCapturePoint: mod.CapturePoint
): void {
    // Track players in objective zones
}

// Called when player leaves a CapturePoint area
export function OnPlayerExitCapturePoint(
    eventPlayer: mod.Player,
    eventCapturePoint: mod.CapturePoint
): void {
    // Update capture state
}

// Called when player enters an AreaTrigger volume
export function OnPlayerEnterAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
): void {
    // Custom trigger zones, boundaries, etc.
}

// Called when player exits an AreaTrigger volume
export function OnPlayerExitAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
): void {
    // Reset state when leaving zone
}
```

### Game Mode Events

```typescript
// Called when the game mode starts (async allowed!)
export async function OnGameModeStarted(): Promise<void> {
    // Initialize game state
    // Can use await for delays and async operations
    await mod.Wait(5); // Wait 5 seconds

    // Setup objectives, enable/disable systems, etc.
}

// Called when game mode is ending
export function OnGameModeEnding(): void {
    // Cleanup, show final scores, etc.
}

// Called continuously during gameplay (like Update loop)
export function OngoingGlobal(): void {
    // Per-frame or continuous logic
    // Be careful with performance here!
}
```

## Common API Functions

### Vector Math

```typescript
// Create a 3D vector (x=left/right, y=up/down, z=forward/back)
const position = mod.CreateVector(100, 0, 100);

// Extract components
const x = mod.XComponentOf(position);
const y = mod.YComponentOf(position);
const z = mod.ZComponentOf(position);

// Modify components
const newPos = mod.CreateVector(x + 10, y - 5, z * 2);

// Also used for RGB colors
const redColor = mod.CreateVector(1, 0, 0);
```

### Object Management

```typescript
// Get objects by ID (IDs assigned in Godot editor)
const capturePoint = mod.GetCapturePoint(0);
const hq = mod.GetHQ(1);
const interactPoint = mod.GetInteractPoint(5);
const areaTrigger = mod.GetAreaTrigger(10);

// Get object ID from reference
const objId = mod.GetObjId(capturePoint);

// Enable/disable objectives
mod.EnableGameModeObjective(capturePoint, true);
mod.EnableHQ(hq, true);
mod.EnableAreaTrigger(areaTrigger, false);
```

### Player Management

```typescript
// Get player's team
const team = mod.GetTeam(player);

// Get team by index
const team1 = mod.GetTeam(0);
const team2 = mod.GetTeam(1);

// Find nearest player to a position
const nearestPlayer = mod.ClosestPlayerTo(position);

// Teleport player
mod.Teleport(player, position, mod.Pi()); // angle in radians

// Deploy/undeploy players
mod.DeployAllPlayers();
mod.UndeployPlayer(player);
mod.EnablePlayerDeploy(player, true);
mod.SetRedeployTime(player, 10); // Set respawn time in seconds
```

### Player State Queries

```typescript
// Get various soldier state information
const eyePos = mod.GetSoldierState(player, mod.SoldierStateVector.EyePosition);
const facingDir = mod.GetSoldierState(player, mod.SoldierStateVector.GetFacingDirection);
const health = mod.GetSoldierState(player, mod.SoldierStateNumber.CurrentHealth);
const isInWater = mod.GetSoldierState(player, mod.SoldierStateBool.IsInWater);
```

### UI and Messages

```typescript
// Create a message
const message = mod.Message('Game starting in 30 seconds!');

// Display notification to different audiences
mod.DisplayNotificationMessage(message);              // All players
mod.DisplayNotificationMessage(message, player);      // Specific player
mod.DisplayNotificationMessage(message, team);        // Entire team
```

### Async Operations

```typescript
// Wait/delay execution
await mod.Wait(5); // Wait 5 seconds

// Common pattern: delayed actions
export async function OnGameModeStarted() {
    mod.DisplayNotificationMessage(mod.Message('Game starting soon...'));
    await mod.Wait(10);
    mod.DisplayNotificationMessage(mod.Message('Get ready!'));
    await mod.Wait(5);
    // Start game logic
}
```

### Game Mode Control

```typescript
// End the game with a winner
mod.EndGameMode(team);          // Team wins
mod.EndGameMode(player);        // Player wins

// Score management
mod.SetGameModeScore(team, 100);
mod.SetGameModeScore(player, 50);
mod.SetGameModeTargetScore(500);

// Time control
mod.SetGameModeTimeLimit(600);  // 600 seconds
mod.PauseGameModeTime(true);
mod.ResetGameModeTime();

// Friendly fire
mod.SetFriendlyFire(true);
```

### Audio and Visual Effects

```typescript
// Play sounds
mod.PlaySound(sfxObject, amplitude);
mod.PlaySound(sfxObject, amplitude, player);
mod.PlaySound(sfxObject, amplitude, team);
mod.PlaySound(sfxObject, amplitude, position, attenuationRange);

// Control sound
mod.EnableSFX(sfx, true);
mod.SetSFXVolume(sfx, 0.5);
mod.StopSound(sfx);

// Visual effects
mod.EnableVFX(vfx, true);
mod.MoveVFX(vfx, position, rotation);
mod.SetVFXColor(vfx, colorVector);
mod.SetVFXScale(vfx, 2.0);
mod.SetVFXSpeed(vfx, 1.5);

// Screen effects
mod.EnableScreenEffect(player, screenEffect, true);
```

### AI Control

```typescript
// Spawn AI from spawner
mod.SpawnAIFromAISpawner(spawner);
mod.SpawnAIFromAISpawner(spawner, soldierClass, name, team);

// AI behaviors
mod.AIBattlefieldBehavior(aiPlayer);
mod.AIDefendPositionBehavior(aiPlayer, position, radius, facingAngle);
mod.AIMoveToBehavior(aiPlayer, targetPosition);
mod.AIIdleBehavior(aiPlayer);

// AI combat settings
mod.AIEnableShooting(aiPlayer, true);
mod.AIEnableTargeting(aiPlayer, true);
mod.AISetTarget(aiPlayer, targetPlayer);
mod.AISetMoveSpeed(aiPlayer, mod.MoveSpeed.Run);
mod.AISetStance(aiPlayer, mod.Stance.Stand);

// Cleanup
mod.UnspawnAllAIsFromAISpawner(spawner);
```

## Important Enums and Constants

### Maps
```typescript
mod.Maps.Abbasid
mod.Maps.Battery
mod.Maps.Capstone
mod.Maps.Firestorm
// ... and more
```

### Soldier Classes
```typescript
mod.SoldierClass.Assault
mod.SoldierClass.Engineer
mod.SoldierClass.Recon
mod.SoldierClass.Support
```

### Death Types
```typescript
mod.PlayerDeathTypes.Headshot
mod.PlayerDeathTypes.Melee
mod.PlayerDeathTypes.Explosion
mod.PlayerDeathTypes.Fall
mod.PlayerDeathTypes.Fire
mod.PlayerDeathTypes.Drowning
// ... and more
```

### Damage Types
```typescript
mod.PlayerDamageTypes.Default
mod.PlayerDamageTypes.Headshot
mod.PlayerDamageTypes.Melee
mod.PlayerDamageTypes.Explosion
mod.PlayerDamageTypes.Fire
mod.PlayerDamageTypes.Fall
```

### Weapons/Gadgets
The API includes extensive enums for:
- `mod.Gadgets` - All gadgets and equipment
- `mod.InventorySlots` - Inventory slot types
- `mod.AmmoTypes` - Ammunition types

## Development Workflow

### 1. Create a New Game Mode

Create a new `.ts` file in the `mods/` directory:

```typescript
// mods/MyGameMode/MyGameMode.ts

// Global state
let gameStarted = false;
let score: Map<mod.Player, number> = new Map();

export async function OnGameModeStarted() {
    // Initialize game state
    const team1 = mod.GetTeam(0);
    const team2 = mod.GetTeam(1);

    mod.DisplayNotificationMessage(mod.Message('Welcome to My Game Mode!'));

    await mod.Wait(3);

    // Enable objectives
    const cp1 = mod.GetCapturePoint(0);
    mod.EnableGameModeObjective(cp1, true);

    gameStarted = true;
}

export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    score.set(eventPlayer, 0);
    mod.DisplayNotificationMessage(
        mod.Message('Player joined!'),
        eventPlayer
    );
}

export function OnPlayerEarnedKill(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    const currentScore = score.get(eventPlayer) || 0;
    score.set(eventPlayer, currentScore + 1);

    // Check win condition
    if (currentScore + 1 >= 10) {
        mod.EndGameMode(eventPlayer);
    }
}
```

### 2. Build the Project

```bash
npm run typecheck  # Verify types
npm run build      # Build for deployment
```

### 3. Level Design in Godot

The Portal SDK integrates with Godot Engine for level design:
- Place and configure game objects (CapturePoints, HQs, InteractPoints, etc.)
- Assign unique ObjIds to objects for script reference
- Define collision volumes for AreaTriggers and CapturePoints
- Use the Portal Tools plugins for specialized objects

### 4. Testing

Use the `mods/Testing/` directory for experimental code.

## Best Practices

### Type Safety
- Always use the `mod.` namespace types
- Let TypeScript's strict mode catch errors early
- Reference the `code/mod/index.d.ts` file for available APIs

### Performance
- Be cautious with `OngoingGlobal()` - it runs continuously
- Use async/await for delays instead of busy loops
- Cache object references instead of repeated lookups

### Event Handling
- Keep event handlers focused and lightweight
- Use global state variables for complex game state
- Remember that `OnPlayerLeaveGame` receives a player number, not a Player object

### Async Patterns
```typescript
// GOOD: Using async/await
export async function OnGameModeStarted() {
    await mod.Wait(5);
    startRound();
}

// BAD: Don't use setTimeout or setInterval
// The Portal runtime doesn't support browser/Node APIs
```

### Object References
```typescript
// GOOD: Get references once at startup
let capturePoint: mod.CapturePoint;

export async function OnGameModeStarted() {
    capturePoint = mod.GetCapturePoint(0);
}

// AVOID: Repeated lookups in event handlers
export function OnPlayerInteract(...) {
    const cp = mod.GetCapturePoint(0); // Wasteful if done often
}
```

## Example: Simple Team Deathmatch

```typescript
// TDM.ts
let team1Score = 0;
let team2Score = 0;
const targetScore = 50;

export async function OnGameModeStarted() {
    mod.SetGameModeTargetScore(targetScore);
    mod.SetGameModeTimeLimit(600); // 10 minutes

    mod.DisplayNotificationMessage(
        mod.Message(`First to ${targetScore} kills wins!`)
    );
}

export function OnPlayerEarnedKill(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    const killerTeam = mod.GetTeam(eventPlayer);
    const team1 = mod.GetTeam(0);

    if (killerTeam === team1) {
        team1Score++;
        mod.SetGameModeScore(team1, team1Score);
        if (team1Score >= targetScore) {
            mod.EndGameMode(team1);
        }
    } else {
        team2Score++;
        const team2 = mod.GetTeam(1);
        mod.SetGameModeScore(team2, team2Score);
        if (team2Score >= targetScore) {
            mod.EndGameMode(team2);
        }
    }
}

export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    mod.DisplayNotificationMessage(
        mod.Message('Welcome to Team Deathmatch!'),
        eventPlayer
    );
}
```

## Resources and Reference

### Primary Documentation
- **Type Definitions**: `code/mod/index.d.ts` - Complete API reference with 14,106 lines of type definitions
- **Template**: `mods/_StartHere_BasicTemplate/BasicTemplate.ts` - Annotated examples of common patterns
- **Examples**: Study `BombSquad.ts`, `Exfil.ts`, and other mods for real-world implementations

### Key Files to Reference
1. `code/mod/index.d.ts` - When you need to know "what functions are available?"
2. `mods/_StartHere_BasicTemplate/BasicTemplate.ts` - When you need to know "how do I use this event?"
3. Existing mod files - When you need to see "how was this implemented in practice?"

## Godot Integration

The SDK includes Godot tools for visual level editing:
- **gdconverter**: Python tools to convert between JSON and Godot scene formats
- **gdplugins**: Godot editor plugins for Portal-specific features
  - Portal Tools: Custom node types (OBBVolume, PolygonVolume)
  - Level Validator: Validates Portal-specific requirements
  - Memory Plugin: Tracks scene memory usage
  - Scene Library: Asset management

## Common Pitfalls

1. **Object IDs**: Objects must be placed in Godot and assigned ObjIds before referencing in code
2. **Async Context**: Only `OnGameModeStarted()` supports async/await in its signature
3. **Player Numbers**: `OnPlayerLeaveGame()` receives a number, not a Player object
4. **Null Checks**: Always validate object references, especially for player interactions
5. **Team Indexing**: Teams are typically 0-indexed (Team 0, Team 1)

## Summary

The Battlefield Portal SDK provides a powerful TypeScript API for creating custom game modes. Key concepts:
- Event-driven architecture with lifecycle callbacks
- Strongly-typed API through the `mod` namespace
- Integration with Godot for level design
- Async/await support for timing and delays
- Rich set of game objects, events, and control functions

Start with the `BasicTemplate.ts`, reference `index.d.ts` for available APIs, and study existing mods for implementation patterns.
