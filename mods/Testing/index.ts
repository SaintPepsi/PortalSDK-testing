/* 

Welcome to basic templates!

Here you can find some of the commonly used events and functions that'll hopefully kickstart your scripting journey. 
'mod/index.d.ts' is your bestfriend when it comes to learning about all that is capable within Portal scripting. 
If you're ever unsure how to do something, try searching for a relevant function in it! 

*/

import { ParseUI } from "modlib";

function MakeMessage(message: string, ...args: any[]) {
  switch (args.length) {
    case 0:
      return mod.Message(message);
    case 1:
      return mod.Message(message, args[0]);
    case 2:
      return mod.Message(message, args[0], args[1]);
    case 3:
      return mod.Message(message, args[0], args[1], args[2]);
    default:
      throw new Error("Invalid number of arguments");
  }
}

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
export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
  // Initialize player choice
  playerChoices.set(eventPlayer, PlayerChoice.None);
}

// Triggered when player leaves the game. Useful for clean up logic, team management, etc.
export function OnPlayerLeaveGame(eventNumber: number): void {}

// Triggered when player selects their class and deploys into game. Useful for any spawn/start logic.
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
  console.log("OnPlayerDeployed called for player:", eventPlayer);

  const choice = playerChoices.get(eventPlayer);

  // If player hasn't made a choice yet, show the welcome screen
  if (choice === PlayerChoice.None) {
    // Prevent player from moving until they make a choice
    mod.UndeployPlayer(eventPlayer);
    showWelcomeScreen(eventPlayer);
    return;
  }

  // Apply loadout based on player choice
  stripPlayer(eventPlayer);

  if (choice === PlayerChoice.Play) {
    // Give player a pistol (M45A1)
    mod.AddEquipment(
      eventPlayer,
      mod.Weapons.Sidearm_M45A1,
      mod.InventorySlots.SecondaryWeapon
    );
  }
  // If choice is Explore, player gets nothing (already stripped)
}

function showWelcomeScreen(eventPlayer: mod.Player): void {
  const playerId = ++uniqueID;
  playerUIIds.set(eventPlayer, playerId);
  const bfBlueColor = [0.678, 0.753, 0.8];

  const containerWidth = 600;
  const containerHeight = 300;
  const buttonWidth = 200;
  const buttonHeight = 60;
  const buttonSpacing = 50;

  const welcomeUI = ParseUI({
    type: "Container",
    size: [containerWidth, containerHeight],
    position: [0, 0],
    name: "welcome_container_" + playerId,
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.Blur,
    bgColor: [0.1, 0.1, 0.2],
    bgAlpha: 0.95,
    playerId: eventPlayer,
    visible: true,
    children: [
      {
        type: "Text",
        name: "welcome_title_" + playerId,
        size: [containerWidth - 40, 80],
        position: [0, -80],
        anchor: mod.UIAnchor.Center,
        bgFill: mod.UIBgFill.None,
        textColor: bfBlueColor,
        textAnchor: mod.UIAnchor.Center,
        textLabel: mod.Message("Hey! Thanks for trying out this experience!"),
        textSize: 32,
      },
      {
        type: "Text",
        name: "welcome_subtitle_" + playerId,
        size: [containerWidth - 40, 60],
        position: [0, -20],
        anchor: mod.UIAnchor.Center,
        bgFill: mod.UIBgFill.None,
        textColor: bfBlueColor,
        textAnchor: mod.UIAnchor.Center,
        textLabel: mod.Message("Would you like to explore or play?"),
        textSize: 24,
      },
      {
        type: "Button",
        name: "btn_play_" + playerId,
        size: [buttonWidth, buttonHeight],
        position: [-buttonWidth / 2 - buttonSpacing / 2, 60],
        anchor: mod.UIAnchor.Center,
        bgFill: mod.UIBgFill.Solid,
        bgColor: [0.2, 0.6, 0.2],
        bgAlpha: 0.9,
        buttonColorBase: [0.2, 0.6, 0.2],
        buttonAlphaBase: 1,
        buttonColorHover: [0.3, 0.8, 0.3],
        buttonAlphaHover: 1,
        buttonColorPressed: [0.1, 0.4, 0.1],
        buttonAlphaPressed: 1,
        children: [
          {
            type: "Text",
            name: "btn_play_text_" + playerId,
            size: [buttonWidth, buttonHeight],
            position: [0, 0],
            anchor: mod.UIAnchor.Center,
            bgFill: mod.UIBgFill.None,
            textColor: [1, 1, 1],
            textAnchor: mod.UIAnchor.Center,
            textLabel: mod.Message("PLAY"),
            textSize: 28,
          },
        ],
      },
      {
        type: "Button",
        name: "btn_explore_" + playerId,
        size: [buttonWidth, buttonHeight],
        position: [buttonWidth / 2 + buttonSpacing / 2, 60],
        anchor: mod.UIAnchor.Center,
        bgFill: mod.UIBgFill.Solid,
        bgColor: [0.2, 0.4, 0.8],
        bgAlpha: 0.9,
        buttonColorBase: [0.2, 0.4, 0.8],
        buttonAlphaBase: 1,
        buttonColorHover: [0.3, 0.5, 1],
        buttonAlphaHover: 1,
        buttonColorPressed: [0.1, 0.2, 0.5],
        buttonAlphaPressed: 1,
        children: [
          {
            type: "Text",
            name: "btn_explore_text_" + playerId,
            size: [buttonWidth, buttonHeight],
            position: [0, 0],
            anchor: mod.UIAnchor.Center,
            bgFill: mod.UIBgFill.None,
            textColor: [1, 1, 1],
            textAnchor: mod.UIAnchor.Center,
            textLabel: mod.Message("EXPLORE"),
            textSize: 28,
          },
        ],
      },
    ],
  });

  console.log("Welcome UI created:", welcomeUI);
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
  // Only respond to button press (ButtonUp event)
  if (eventUIButtonEvent !== mod.UIButtonEvent.ButtonUp) {
    return;
  }

  const widgetName = mod.GetUIWidgetName(eventUIWidget);
  console.log("Button clicked:", widgetName);

  // Check if it's one of our welcome screen buttons
  if (widgetName.startsWith("btn_play_")) {
    handlePlayerChoice(eventPlayer, PlayerChoice.Play);
  } else if (widgetName.startsWith("btn_explore_")) {
    handlePlayerChoice(eventPlayer, PlayerChoice.Explore);
  }
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
    console.log("Error stripping player:", error);
  }
}

// Triggered on main gamemode start/end. Useful for game start setup and cleanup.
export async function OnGameModeStarted() {
  mod.SetSpawnMode(mod.SpawnModes.AutoSpawn);
  console.log("Game Mode Started");

  // Enables or disables a headquater. Note that HQ_PlayerSpawner has to be placed in Godot scene, assigned an ObjId and a HQArea(CollisionPolygon3D).
  const hq = mod.GetHQ(0);
  mod.EnableHQ(hq, true);

  // Enables or disables the provided objective.
  const capturePoint = mod.GetCapturePoint(0);
  console.log("capturePoint", capturePoint);
  mod.EnableGameModeObjective(capturePoint, true);

  // Returns the id corresponding to the provided object.
  const capturePointId = mod.GetObjId(capturePoint);

  // Returns a vector composed of three provided 'X' (left), 'Y' (up), and 'Z' (forward) values.
  // Useful for specifying transform, 3d velocity or RGB color.
  const vector = mod.CreateVector(1, 2, 3);

  // Get player closest to a point
  const player = mod.ClosestPlayerTo(vector);

  // Returns the team value of the specified player OR the corresponding team of the provided number.
  const teamOfPlayer = mod.GetTeam(player);
  const teamObject = mod.GetTeam(0);

  // Displays a notification-type Message on the top-right of the screen for 6 seconds. Useful for communicating game state/info or debugging.
  const exampleMessage = mod.Message("example");
  mod.DisplayNotificationMessage(exampleMessage);
  mod.DisplayNotificationMessage(exampleMessage, player);
  mod.DisplayNotificationMessage(exampleMessage, teamOfPlayer);

  // Adds X delay in seconds. Useful for making sure that everything has been initialized before running logic or delaying triggers.
  await mod.Wait(5);

  // Teleports a target to a provided valid position facing a specified angle (in radians).
  mod.Teleport(player, mod.CreateVector(100, 0, 100), mod.Pi());

  // Returns the 'X', 'Y', or 'Z' component of a provided vector.
  // Useful for modifying specific vector component or debugging transform.
  const x = mod.XComponentOf(vector);
  const y = mod.YComponentOf(vector);
  const z = mod.ZComponentOf(vector);
  const changedVector = mod.CreateVector(x + 10, y - 5, z * 2);

  // Returns various player state information
  const eyePosition = mod.GetSoldierState(
    player,
    mod.SoldierStateVector.EyePosition
  );
  const facingDirection = mod.GetSoldierState(
    player,
    mod.SoldierStateVector.GetFacingDirection
  );
  const health = mod.GetSoldierState(
    player,
    mod.SoldierStateNumber.CurrentHealth
  );
  const isInWater = mod.GetSoldierState(player, mod.SoldierStateBool.IsInWater);
}
