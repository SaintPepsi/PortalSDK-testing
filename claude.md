# Portal SDK - Claude Code Documentation

## What This Is

TypeScript SDK for Battlefield Portal game modes. Scripts use the `mod` namespace to interact with the game engine.

## Key Files

- **`code/mod/index.d.ts`** - Complete API definitions (14k lines) - THE authoritative reference
- **`mods/_StartHere_BasicTemplate/BasicTemplate.ts`** - Canonical usage patterns and examples
- **`mods/BombSquad.ts`, `mods/Exfil.ts`** - Real-world implementations
- **Debug logs**: `C:\Users\Ian\AppData\Local\Temp\Battlefield™ 6\PortalLog.txt`

## Tech Stack

TypeScript 5.3.3, Vite 7.1+, Node 20.6.0, ES2020 target

**Build**: `npm run build` | `npm run typecheck` | `npm run rebuild`

## Architecture

### Event-Driven Model

Game modes export functions with specific names (e.g., `OnPlayerJoinGame`, `OnPlayerDied`, `OnGameModeStarted`) that the engine calls. See `BasicTemplate.ts` for complete list.

### Object System

Game objects (CapturePoint, HQ, InteractPoint, AreaTrigger) are placed in Godot with unique ObjIds, then retrieved in code via `mod.GetCapturePoint(id)` etc.

### UI System

Uses `ParseUI` helper from `modlib`. Widget hierarchy: Container (can have children), Text/Button/Image (cannot have children, use `parent` property instead).

## Non-Obvious Gotchas

1. **Only `OnGameModeStarted()` supports async/await** - other handlers are sync-only
2. **`OnPlayerLeaveGame` receives a number**, not a Player object
3. **UI `children` property only works on Container widgets** - use explicit `parent` for others
4. **Teams are 0-indexed** (Team 0, Team 1)
5. **Vectors serve dual purpose**: 3D positions (x=left/right, y=up/down, z=forward/back) AND RGB colors
6. **No browser/Node runtime APIs** - use `mod.Wait()` instead of setTimeout
7. **Always wrap UI text in `mod.Message()`**
8. **Cache object references** - get them once in OnGameModeStarted, not in every event handler

## Godot Integration

Level editor places game objects and assigns ObjIds. Plugins in `code/gdplugins/` provide Portal-specific tools.
