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

## Debug logs

Debug log generated when running the server locally are put in: C:\Users\Ian\AppData\Local\Temp\Battlefieldâ„¢ 6\PortalLog.txt

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
  eventPlayer: mod.Player, // The player who died
  eventOtherPlayer: mod.Player, // The killer
  eventDeathType: mod.DeathType, // How they died
  eventWeaponUnlock: mod.WeaponUnlock // Weapon used
): void {
  // Update scores, respawn logic, kill streak tracking
}

// Called when a player earns a kill
export function OnPlayerEarnedKill(
  eventPlayer: mod.Player, // The killer
  eventOtherPlayer: mod.Player, // The victim
  eventDeathType: mod.DeathType,
  eventWeaponUnlock: mod.WeaponUnlock
): void {
  // Award points, achievements, etc.
}

// Called when a player takes damage (but doesn't die)
export function OnPlayerDamaged(
  eventPlayer: mod.Player, // Player taking damage
  eventOtherPlayer: mod.Player, // Attacker
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
const facingDir = mod.GetSoldierState(
  player,
  mod.SoldierStateVector.GetFacingDirection
);
const health = mod.GetSoldierState(
  player,
  mod.SoldierStateNumber.CurrentHealth
);
const isInWater = mod.GetSoldierState(player, mod.SoldierStateBool.IsInWater);
```

### UI and Messages

```typescript
// Create a message
const message = mod.Message("Game starting in 30 seconds!");

// Display notification to different audiences
mod.DisplayNotificationMessage(message); // All players
mod.DisplayNotificationMessage(message, player); // Specific player
mod.DisplayNotificationMessage(message, team); // Entire team
```

## User Interface (UI) System

The Portal SDK provides a comprehensive UI system for creating custom menus, HUDs, and interactive elements. The SDK includes a helper library (`modlib`) with a `ParseUI` function that simplifies UI creation.

### UI Widget Types

The Portal API supports four main widget types:

1. **Container** - Layout container that holds other widgets
2. **Text** - Text labels and displays
3. **Image** - Image displays with various types
4. **Button** - Interactive buttons that trigger events

### Core UI Functions

```typescript
// Get the root UI widget (parent of all UI)
const root = mod.GetUIRoot();

// Create UI widgets directly using mod API
mod.AddUIContainer(
  name,
  position,
  size,
  anchor,
  parent,
  visible,
  padding,
  bgColor,
  bgAlpha,
  bgFill
);
mod.AddUIText(
  name,
  position,
  size,
  anchor,
  parent,
  visible,
  padding,
  bgColor,
  bgAlpha,
  bgFill,
  textLabel,
  textSize,
  textColor,
  textAlpha,
  textAnchor
);
mod.AddUIButton(
  name,
  position,
  size,
  anchor,
  parent,
  visible,
  padding,
  bgColor,
  bgAlpha,
  bgFill,
  buttonEnabled,
  buttonColorBase,
  buttonAlphaBase,
  buttonColorDisabled,
  buttonAlphaDisabled,
  buttonColorPressed,
  buttonAlphaPressed,
  buttonColorHover,
  buttonAlphaHover,
  buttonColorFocused,
  buttonAlphaFocused
);
mod.AddUIImage(
  name,
  position,
  size,
  anchor,
  parent,
  visible,
  padding,
  bgColor,
  bgAlpha,
  bgFill,
  imageType,
  imageColor,
  imageAlpha
);

// Widget management
const widget = mod.FindUIWidgetWithName("my_widget");
mod.DeleteUIWidget(widget);
mod.SetUIWidgetName(widget, "new_name");
const widgetName = mod.GetUIWidgetName(widget);
mod.SetUIWidgetVisibility(widget, true);
mod.SetUIWidgetPosition(widget, position);
mod.SetUIWidgetSize(widget, size);
```

### Using the ParseUI Helper (Recommended)

The `ParseUI` function from `modlib` simplifies UI creation with a JSON-like object syntax:

```typescript
import { ParseUI } from "modlib";

// Basic example - create a simple text widget
const myText = ParseUI({
  type: "Text",
  name: "my_text",
  size: [300, 50],
  position: [0, 100],
  anchor: mod.UIAnchor.TopCenter,
  textLabel: mod.Message("Hello World!"),
  textSize: 24,
  textColor: [1, 1, 1], // White (RGB)
  bgFill: mod.UIBgFill.None,
});
```

### UI Anchors

UI anchors determine the reference point for positioning and alignment:

```typescript
mod.UIAnchor.TopLeft;
mod.UIAnchor.TopCenter;
mod.UIAnchor.TopRight;
mod.UIAnchor.CenterLeft;
mod.UIAnchor.Center;
mod.UIAnchor.CenterRight;
mod.UIAnchor.BottomLeft;
mod.UIAnchor.BottomCenter;
mod.UIAnchor.BottomRight;
```

### Background Fill Types

```typescript
mod.UIBgFill.None; // Transparent, no background
mod.UIBgFill.Solid; // Solid color background
mod.UIBgFill.Blur; // Blurred background effect
```

### Player/Team Restricted UI

UI widgets can be restricted to specific players or teams:

```typescript
// Show only to a specific player
ParseUI({
  type: "Text",
  name: "player_message",
  playerId: eventPlayer, // Only this player sees it
  textLabel: mod.Message("This is just for you!"),
  // ... other properties
});

// Show only to a specific team
ParseUI({
  type: "Text",
  name: "team_message",
  teamId: team1, // Only team1 sees it
  textLabel: mod.Message("Team-only message!"),
  // ... other properties
});
```

### Creating UI Hierarchies

**IMPORTANT:** The `ParseUI` function only supports the `children` property for **Container** widgets. Buttons, Text, and Image widgets do not support nested children in their definition.

#### Correct Pattern: Containers with Children

```typescript
// Container with text children - CORRECT
const panel = ParseUI({
  type: "Container",
  name: "my_panel",
  size: [400, 300],
  position: [0, 0],
  anchor: mod.UIAnchor.Center,
  bgFill: mod.UIBgFill.Blur,
  bgColor: [0.1, 0.1, 0.2],
  bgAlpha: 0.9,
  children: [
    {
      type: "Text",
      name: "title",
      size: [380, 60],
      position: [0, -100],
      anchor: mod.UIAnchor.Center,
      textLabel: mod.Message("My Title"),
      textSize: 32,
    },
    {
      type: "Text",
      name: "subtitle",
      size: [380, 40],
      position: [0, -40],
      anchor: mod.UIAnchor.Center,
      textLabel: mod.Message("Subtitle here"),
      textSize: 20,
    },
  ],
});
```

#### Incorrect Pattern: Buttons with Children

```typescript
// DON'T DO THIS - children in buttons are IGNORED
ParseUI({
  type: "Button",
  name: "my_button",
  children: [
    // ❌ This will NOT work!
    {
      type: "Text",
      name: "button_label",
      textLabel: mod.Message("Click Me"),
    },
  ],
});
```

#### Correct Pattern: Buttons with Labels

Create buttons and their labels separately, using the `parent` property:

```typescript
// Create the container first
const container = ParseUI({
  type: "Container",
  name: "menu_container",
  size: [600, 400],
  position: [0, 0],
  anchor: mod.UIAnchor.Center,
  bgFill: mod.UIBgFill.Blur,
});

// Create the button as a child of the container
const playButton = ParseUI({
  type: "Button",
  name: "btn_play",
  size: [200, 60],
  position: [0, 100],
  anchor: mod.UIAnchor.Center,
  parent: container, // Explicitly set parent
  bgFill: mod.UIBgFill.Solid,
  bgColor: [0.2, 0.6, 0.2],
  buttonColorBase: [0.2, 0.6, 0.2],
  buttonColorHover: [0.3, 0.8, 0.3],
  buttonColorPressed: [0.1, 0.4, 0.1],
});

// Create the button label as a child of the button
ParseUI({
  type: "Text",
  name: "btn_play_label",
  size: [200, 60],
  position: [0, 0],
  anchor: mod.UIAnchor.Center,
  parent: playButton, // Parent is the button widget
  bgFill: mod.UIBgFill.None,
  textLabel: mod.Message("PLAY"),
  textSize: 28,
  textColor: [1, 1, 1],
  textAnchor: mod.UIAnchor.Center,
});
```

### Handling Button Events

Export the `OnPlayerUIButtonEvent` function to handle button clicks:

```typescript
export function OnPlayerUIButtonEvent(
  eventPlayer: mod.Player,
  eventUIWidget: mod.UIWidget,
  eventUIButtonEvent: mod.UIButtonEvent
): void {
  // Only respond to button release (not press)
  if (eventUIButtonEvent !== mod.UIButtonEvent.ButtonUp) {
    return;
  }

  const widgetName = mod.GetUIWidgetName(eventUIWidget);

  if (widgetName === "btn_play") {
    // Handle play button click
    handlePlayButton(eventPlayer);
  } else if (widgetName === "btn_exit") {
    // Handle exit button click
    handleExitButton(eventPlayer);
  }
}

// Button event types
mod.UIButtonEvent.ButtonDown; // Triggered when button is pressed
mod.UIButtonEvent.ButtonUp; // Triggered when button is released (use this)
```

### Complete UI Example: Welcome Screen

```typescript
import { ParseUI } from "modlib";

const playerUIIds = new Map<mod.Player, number>();
let uniqueID = 0;

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
  showWelcomeScreen(eventPlayer);
}

function showWelcomeScreen(eventPlayer: mod.Player): void {
  const playerId = ++uniqueID;
  playerUIIds.set(eventPlayer, playerId);

  // Create the main container
  const container = ParseUI({
    type: "Container",
    size: [600, 300],
    position: [0, 0],
    name: "welcome_container_" + playerId,
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.Blur,
    bgColor: [0.1, 0.1, 0.2],
    bgAlpha: 0.95,
    playerId: eventPlayer, // Only show to this player
    visible: true,
    children: [
      {
        type: "Text",
        name: "welcome_title_" + playerId,
        size: [560, 80],
        position: [0, -80],
        anchor: mod.UIAnchor.Center,
        bgFill: mod.UIBgFill.None,
        textColor: [0.678, 0.753, 0.8],
        textAnchor: mod.UIAnchor.Center,
        textLabel: mod.Message("Welcome!"),
        textSize: 32,
      },
      {
        type: "Text",
        name: "welcome_subtitle_" + playerId,
        size: [560, 60],
        position: [0, -20],
        anchor: mod.UIAnchor.Center,
        bgFill: mod.UIBgFill.None,
        textColor: [0.678, 0.753, 0.8],
        textAnchor: mod.UIAnchor.Center,
        textLabel: mod.Message("Choose your action:"),
        textSize: 24,
      },
    ],
  });

  // Create buttons separately
  const playButton = ParseUI({
    type: "Button",
    name: "btn_play_" + playerId,
    size: [200, 60],
    position: [-125, 60],
    anchor: mod.UIAnchor.Center,
    parent: container,
    bgFill: mod.UIBgFill.Solid,
    bgColor: [0.2, 0.6, 0.2],
    buttonColorBase: [0.2, 0.6, 0.2],
    buttonColorHover: [0.3, 0.8, 0.3],
    buttonColorPressed: [0.1, 0.4, 0.1],
  });

  ParseUI({
    type: "Text",
    name: "btn_play_text_" + playerId,
    size: [200, 60],
    position: [0, 0],
    anchor: mod.UIAnchor.Center,
    parent: playButton,
    bgFill: mod.UIBgFill.None,
    textColor: [1, 1, 1],
    textAnchor: mod.UIAnchor.Center,
    textLabel: mod.Message("PLAY"),
    textSize: 28,
  });

  const exitButton = ParseUI({
    type: "Button",
    name: "btn_exit_" + playerId,
    size: [200, 60],
    position: [125, 60],
    anchor: mod.UIAnchor.Center,
    parent: container,
    bgFill: mod.UIBgFill.Solid,
    bgColor: [0.8, 0.2, 0.2],
    buttonColorBase: [0.8, 0.2, 0.2],
    buttonColorHover: [1, 0.3, 0.3],
    buttonColorPressed: [0.5, 0.1, 0.1],
  });

  ParseUI({
    type: "Text",
    name: "btn_exit_text_" + playerId,
    size: [200, 60],
    position: [0, 0],
    anchor: mod.UIAnchor.Center,
    parent: exitButton,
    bgFill: mod.UIBgFill.None,
    textColor: [1, 1, 1],
    textAnchor: mod.UIAnchor.Center,
    textLabel: mod.Message("EXIT"),
    textSize: 28,
  });
}

export function OnPlayerUIButtonEvent(
  eventPlayer: mod.Player,
  eventUIWidget: mod.UIWidget,
  eventUIButtonEvent: mod.UIButtonEvent
): void {
  if (eventUIButtonEvent !== mod.UIButtonEvent.ButtonUp) {
    return;
  }

  const widgetName = mod.GetUIWidgetName(eventUIWidget);

  if (widgetName.startsWith("btn_play_")) {
    // Clean up UI
    const playerId = playerUIIds.get(eventPlayer);
    if (playerId !== undefined) {
      const containerWidget = mod.FindUIWidgetWithName(
        "welcome_container_" + playerId
      );
      if (containerWidget) {
        mod.DeleteUIWidget(containerWidget);
      }
    }

    // Start playing
    mod.DeployPlayer(eventPlayer);
  } else if (widgetName.startsWith("btn_exit_")) {
    // Handle exit
    mod.UndeployPlayer(eventPlayer);
  }
}
```

### UI Best Practices

1. **Use unique widget names** - Include player IDs or unique identifiers to avoid conflicts
2. **Clean up UI widgets** - Delete widgets when no longer needed to prevent memory leaks
3. **Use ParseUI for complex hierarchies** - Easier to read and maintain than raw API calls
4. **Remember the children limitation** - Only Containers support the `children` property
5. **Use player/team restrictions** - Show UI only to relevant players for better performance
6. **Handle ButtonUp events** - More reliable than ButtonDown for click detection
7. **Cache widget references** - Store frequently accessed widgets instead of repeated lookups
8. **Use mod.Message()** - Always wrap strings in `mod.Message()` for text labels

### Async Operations

```typescript
// Wait/delay execution
await mod.Wait(5); // Wait 5 seconds

// Common pattern: delayed actions
export async function OnGameModeStarted() {
  mod.DisplayNotificationMessage(mod.Message("Game starting soon..."));
  await mod.Wait(10);
  mod.DisplayNotificationMessage(mod.Message("Get ready!"));
  await mod.Wait(5);
  // Start game logic
}
```

### Game Mode Control

```typescript
// End the game with a winner
mod.EndGameMode(team); // Team wins
mod.EndGameMode(player); // Player wins

// Score management
mod.SetGameModeScore(team, 100);
mod.SetGameModeScore(player, 50);
mod.SetGameModeTargetScore(500);

// Time control
mod.SetGameModeTimeLimit(600); // 600 seconds
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
mod.Maps.Abbasid;
mod.Maps.Battery;
mod.Maps.Capstone;
mod.Maps.Firestorm;
// ... and more
```

### Soldier Classes

```typescript
mod.SoldierClass.Assault;
mod.SoldierClass.Engineer;
mod.SoldierClass.Recon;
mod.SoldierClass.Support;
```

### Death Types

```typescript
mod.PlayerDeathTypes.Headshot;
mod.PlayerDeathTypes.Melee;
mod.PlayerDeathTypes.Explosion;
mod.PlayerDeathTypes.Fall;
mod.PlayerDeathTypes.Fire;
mod.PlayerDeathTypes.Drowning;
// ... and more
```

### Damage Types

```typescript
mod.PlayerDamageTypes.Default;
mod.PlayerDamageTypes.Headshot;
mod.PlayerDamageTypes.Melee;
mod.PlayerDamageTypes.Explosion;
mod.PlayerDamageTypes.Fire;
mod.PlayerDamageTypes.Fall;
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

  mod.DisplayNotificationMessage(mod.Message("Welcome to My Game Mode!"));

  await mod.Wait(3);

  // Enable objectives
  const cp1 = mod.GetCapturePoint(0);
  mod.EnableGameModeObjective(cp1, true);

  gameStarted = true;
}

export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
  score.set(eventPlayer, 0);
  mod.DisplayNotificationMessage(mod.Message("Player joined!"), eventPlayer);
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
    mod.Message("Welcome to Team Deathmatch!"),
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
