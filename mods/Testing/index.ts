/*

Welcome to basic templates!

Here you can find some of the commonly used events and functions that'll hopefully kickstart your scripting journey.
'mod/index.d.ts' is your bestfriend when it comes to learning about all that is capable within Portal scripting.
If you're ever unsure how to do something, try searching for a relevant function in it!

*/

import { ModeSelector } from "./ui/modeSelector";

// Track player choices
enum PlayerChoice {
  None,
  Play,
  Explore,
}

const playerChoices = new Map<mod.Player, PlayerChoice>();
const playerUIIds = new Map<mod.Player, number>();
let uniqueID: number = 0;

////////////////////////////////// ON PLAYER EVENTS ///////////////////////////////////////
//////////// Useful player action-related events to hook up reactive logics to ////////////

// Triggered when player joins the game. Useful for pregame setup, team management, etc.
export async function OnPlayerJoinGame(eventPlayer: mod.Player): Promise<void> {
  mod.DisplayNotificationMessage(mod.Message(">>> OnPlayerJoinGame START <<<"));

  // Initialize player choice
  playerChoices.set(eventPlayer, PlayerChoice.None);

  mod.DisplayNotificationMessage(
    mod.Message("Player joined, choice set to None")
  );

  // With AutoSpawn mode, player will deploy automatically
  // We'll show the UI in OnPlayerDeployed and undeploy them there
}

function GetPlayerName(player: mod.Player): string {
  return mod.Message(player.toString()).toString();
}

function IsPlayer(name: string, player: mod.Player): boolean {
  return GetPlayerName(player) == mod.Message(name).toString();
}

// Triggered when player leaves the game. Useful for clean up logic, team management, etc.
export function OnPlayerLeaveGame(eventNumber: number): void {}

// Triggered when player deploys into game. With AutoSpawn this happens automatically.
export async function OnPlayerDeployed(eventPlayer: mod.Player): Promise<void> {
  mod.DisplayNotificationMessage(
    mod.Message("=== OnPlayerDeployed called ===")
  );

  // They've made a choice, apply loadout
  // stripPlayer(eventPlayer);

  const modeSelector = new ModeSelector(eventPlayer);

  // const simple_ui = new SimpleUI();
  // simple_ui.show();

  // await mod.Wait(1);

  // console.log("playerName", eventPlayer.toString());
  // mod.DisplayHighlightedWorldLogMessage(
  //   mod.Message(mod.stringkeys.player_joined, eventPlayer.toString())
  // );

  // const simple_ui_counter = new SimpleCounterUI();
  // simple_ui_counter.counter = 0;
  // simple_ui_counter.show();
  // while (true) {
  //   simple_ui_counter.update();
  //   await mod.Wait(1); // this is important
  //   simple_ui_counter.counter += 1;

  //   mod.DisplayHighlightedWorldLogMessage(
  //     mod.Message(mod.stringkeys.player_joined, eventPlayer.toString())
  //   );
  // }

  // Give player a pistol (M45A1)
  // mod.AddEquipment(
  //   eventPlayer,
  //   mod.Weapons.Sidearm_M45A1,
  //   mod.InventorySlots.SecondaryWeapon
  // );
  // If choice is Explore, player gets nothing (already stripped)
}

// Triggered on player death/kill, returns dying player, the killer, etc. Useful for updating scores, updating progression, handling any death/kill related logic.
export function OnPlayerDied(
  eventPlayer: mod.Player,
  eventOtherPlayer: mod.Player,
  eventDeathType: mod.DeathType,
  eventWeaponUnlock: mod.WeaponUnlock
): void {}

export function OnPlayerEarnedKill(
  eventPlayer: mod.Player,
  eventOtherPlayer: mod.Player,
  eventDeathType: mod.DeathType,
  eventWeaponUnlock: mod.WeaponUnlock
): void {}

// Triggered when a player is damaged, returns same variables as OnPlayerDied. Useful for custom on damage logic and updating custom UI.
export function OnPlayerDamaged(
  eventPlayer: mod.Player,
  eventOtherPlayer: mod.Player,
  eventDamageType: mod.DamageType,
  eventWeaponUnlock: mod.WeaponUnlock
): void {}

// Triggered when a player interacts with InteractPoint. Reference by using 'mod.GetObjId(InteractPoint);'.
// Useful for any custom logic on player interaction such as updating check point, open custom UI, etc.
// Note that InteractPoint has to be placed in Godot scene and assigned an ObjId for reference.
export function OnPlayerInteract(
  eventPlayer: mod.Player,
  eventInteractPoint: mod.InteractPoint
): void {}

// Triggered when a player enters/leaves referenced BF6 capture point. Useful for tracking capture point activities and overlapping players.
// Note that CapturePoint has to be placed in Godot scene, assigned an ObjId and a CapturePointArea(volume).
export function OnPlayerEnterCapturePoint(
  eventPlayer: mod.Player,
  eventCapturePoint: mod.CapturePoint
): void {}
export function OnPlayerExitCapturePoint(
  eventPlayer: mod.Player,
  eventCapturePoint: mod.CapturePoint
): void {}

// Triggered when a player enters/leaves referenced AreaTrigger volume. Useful for creating custom OnOverlap logic, creating custom capture point, etc.
// Note that AreaTrigger has to be placed in Godot scene, assigned an ObjId and a CollisionPolygon3D(volume).
export function OnPlayerEnterAreaTrigger(
  eventPlayer: mod.Player,
  eventAreaTrigger: mod.AreaTrigger
): void {}
export function OnPlayerExitAreaTrigger(
  eventPlayer: mod.Player,
  eventAreaTrigger: mod.AreaTrigger
): void {}

// Triggered when player clicks a UI button
export function OnPlayerUIButtonEvent(
  eventPlayer: mod.Player,
  eventUIWidget: mod.UIWidget,
  eventUIButtonEvent: mod.UIButtonEvent
): void {
  // Use the new UI.handleButtonClick to handle onClick events
  // handleButtonClick(eventPlayer, eventUIWidget, eventUIButtonEvent);
  ModeSelector.OnPlayerUIButtonEvent(
    eventPlayer,
    eventUIWidget,
    eventUIButtonEvent
  );
}

function handlePlayerChoice(player: mod.Player, choice: PlayerChoice): void {
  // Save the player's choice
  playerChoices.set(player, choice);

  // Hide the welcome screen by finding and deleting the container
  const playerId = playerUIIds.get(player);
  if (playerId !== undefined) {
    const containerName = "welcome_container_" + playerId;
    const containerWidget = mod.FindUIWidgetWithName(containerName);

    if (containerWidget) {
      mod.DeleteUIWidget(containerWidget);
    }
  }

  // Deploy the player with their chosen loadout
  mod.DeployPlayer(player);
}

/////////////////////// GAMEMODE EVENTS AND USEFUL FUNCTIONS //////////////////////////////
////////// Various useful events and functions to manipulate gameplay and actors //////////

export function OnGameModeEnding(): void {}

export function OngoingGlobal(): void {}

function stripPlayer(player: mod.Player): void {
  try {
    //Add remove weapons code
    mod.RemoveEquipment(player, mod.InventorySlots.PrimaryWeapon);
    mod.RemoveEquipment(player, mod.InventorySlots.SecondaryWeapon);
    mod.RemoveEquipment(player, mod.InventorySlots.GadgetOne);
    mod.RemoveEquipment(player, mod.InventorySlots.GadgetTwo);
    mod.RemoveEquipment(player, mod.InventorySlots.ClassGadget);
    mod.RemoveEquipment(player, mod.InventorySlots.Throwable);
  } catch (error) {
    console.log("Error stripping player: ", JSON.stringify(error, null, 2));
  }
}

// Triggered on main gamemode start/end. Useful for game start setup and cleanup.
export async function OnGameModeStarted() {
  // CRITICAL TEST: This should show to everyone when the game starts
  mod.DisplayNotificationMessage(mod.Message("!!! TESTING MOD LOADED !!!"));

  // Set AutoSpawn mode to skip the deployment screen entirely
  mod.SetSpawnMode(mod.SpawnModes.AutoSpawn);

  await mod.Wait(2);
  mod.DisplayNotificationMessage(mod.Message("AutoSpawn mode enabled"));

  // Enables or disables a headquater. Note that HQ_PlayerSpawner has to be placed in Godot scene, assigned an ObjId and a HQArea(CollisionPolygon3D).
  const hq = mod.GetHQ(0);
  mod.EnableHQ(hq, true);

  // Enables or disables the provided objective.
  // const capturePoint = mod.GetCapturePoint(0);
  // console.log("capturePoint", capturePoint);
  // mod.EnableGameModeObjective(capturePoint, true);

  // Returns the id corresponding to the provided object.
  // const capturePointId = mod.GetObjId(capturePoint);

  // Returns a vector composed of three provided 'X' (left), 'Y' (up), and 'Z' (forward) values.
  // Useful for specifying transform, 3d velocity or RGB color.
  // const vector = mod.CreateVector(1, 2, 3);

  // Get player closest to a point
  // const player = mod.ClosestPlayerTo(vector);

  // Returns the team value of the specified player OR the corresponding team of the provided number.
  // const teamOfPlayer = mod.GetTeam(player);
  // const teamObject = mod.GetTeam(0);

  // Displays a notification-type Message on the top-right of the screen for 6 seconds. Useful for communicating game state/info or debugging.
  // const exampleMessage = mod.Message("example");
  // mod.DisplayNotificationMessage(exampleMessage);
  // mod.DisplayNotificationMessage(exampleMessage, player);
  // mod.DisplayNotificationMessage(exampleMessage, teamOfPlayer);

  // Adds X delay in seconds. Useful for making sure that everything has been initialized before running logic or delaying triggers.
  // await mod.Wait(5);

  // Teleports a target to a provided valid position facing a specified angle (in radians).
  // mod.Teleport(player, mod.CreateVector(100, 0, 100), mod.Pi());

  // Returns the 'X', 'Y', or 'Z' component of a provided vector.
  // Useful for modifying specific vector component or debugging transform.
  // const x = mod.XComponentOf(vector);
  // const y = mod.YComponentOf(vector);
  // const z = mod.ZComponentOf(vector);
  // const changedVector = mod.CreateVector(x + 10, y - 5, z * 2);

  // // Returns various player state information
  // const eyePosition = mod.GetSoldierState(
  //   player,
  //   mod.SoldierStateVector.EyePosition
  // );
  // const facingDirection = mod.GetSoldierState(
  //   player,
  //   mod.SoldierStateVector.GetFacingDirection
  // );
  // const health = mod.GetSoldierState(
  //   player,
  //   mod.SoldierStateNumber.CurrentHealth
  // );
  // const isInWater = mod.GetSoldierState(player, mod.SoldierStateBool.IsInWater);
}
