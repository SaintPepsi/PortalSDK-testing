/*

Welcome to basic templates!

Here you can find some of the commonly used events and functions that'll hopefully kickstart your scripting journey.
'mod/index.d.ts' is your bestfriend when it comes to learning about all that is capable within Portal scripting.
If you're ever unsure how to do something, try searching for a relevant function in it!

*/

import { Button, handleButtonClick } from "./ui/components/Button";
import { Container } from "./ui/components/Container";
import { Text } from "./ui/components/Text";

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

// Triggered when player leaves the game. Useful for clean up logic, team management, etc.
export function OnPlayerLeaveGame(eventNumber: number): void {}

// Triggered when player deploys into game. With AutoSpawn this happens automatically.
export async function OnPlayerDeployed(eventPlayer: mod.Player): Promise<void> {
  mod.DisplayNotificationMessage(
    mod.Message("=== OnPlayerDeployed called ===")
  );

  const choice = playerChoices.get(eventPlayer);
  const choiceStr =
    choice === undefined
      ? "UNDEFINED"
      : choice === PlayerChoice.None
      ? "NONE"
      : "CHOSEN";
  mod.DisplayNotificationMessage(mod.Message("Player choice: ", choiceStr));

  // If player hasn't made a choice yet (or isn't in the map), show UI then undeploy them
  if (choice === PlayerChoice.None || choice === undefined) {
    mod.DisplayNotificationMessage(mod.Message(">>> Showing UI..."));

    // Show the welcome screen FIRST
    showWelcomeScreen(eventPlayer);

    mod.DisplayNotificationMessage(mod.Message(">>> Undeploying player..."));
    // Wait a tiny bit for UI to register
    await mod.Wait(0.1);

    // Now undeploy them back to spectator
    mod.UndeployPlayer(eventPlayer);
    mod.DisplayNotificationMessage(mod.Message(">>> Player undeployed"));
    return;
  }

  // They've made a choice, apply loadout
  mod.DisplayNotificationMessage(mod.Message("Player chose, applying loadout"));
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

  console.log("eventPlayer", eventPlayer);
  console.log(JSON.stringify(eventPlayer, null, 2));

  playerUIIds.set(eventPlayer, playerId);
  const bfBlueColor: Text.Props["textColor"] = [0.678, 0.753, 0.8];

  const containerWidth = 600;
  const containerHeight = 300;
  const buttonWidth = 200;
  const buttonHeight = 60;
  const buttonSpacing = 50;

  console.log(
    "Creating welcome screen for player: ",
    mod.GetObjId(eventPlayer)
  );
  console.log("Player is valid? ", String(mod.IsPlayerValid(eventPlayer)));
  console.log(
    "Player is alive? ",
    String(mod.GetSoldierState(eventPlayer, mod.SoldierStateBool.IsAlive))
  );

  // Create the container using new UI namespace
  const container = Container({
    size: [containerWidth, containerHeight],
    position: [0, 0],
    name: "welcome_container_" + playerId,
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.Solid,
    bgColor: [0.1, 0.1, 0.2],
    bgAlpha: 0.95,
    visible: true,
  });

  // Create title text
  Text({
    parent: container,
    name: "welcome_title_" + playerId,
    size: [containerWidth - 40, 80],
    position: [0, -80],
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.None,
    textColor: bfBlueColor,
    textAnchor: mod.UIAnchor.Center,
    label: mod.Message("Hey! Thanks for trying out this experience!"),
    textSize: 32,
  });

  // Create subtitle text
  Text({
    parent: container,
    name: "welcome_subtitle_" + playerId,
    size: [containerWidth - 40, 60],
    position: [0, -20],
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.None,
    textColor: bfBlueColor,
    textAnchor: mod.UIAnchor.Center,
    label: mod.Message("Would you like to explore or play?"),
    textSize: 24,
  });

  // Create "PLAY" button with onClick handler
  const playButton = Button({
    parent: container,
    name: "btn_play_" + playerId,
    size: [buttonWidth, buttonHeight],
    position: [-buttonWidth / 2 - buttonSpacing / 2, 60],
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.Solid,
    bgColor: [0.2, 0.6, 0.2],
    bgAlpha: 0.9,
    colorBase: [0.2, 0.6, 0.2],
    alphaBase: 1,
    colorHover: [0.3, 0.8, 0.3],
    alphaHover: 1,
    colorPressed: [0.1, 0.4, 0.1],
    alphaPressed: 1,
    onClick: (player) => handlePlayerChoice(player, PlayerChoice.Play),
  });

  // Play button text
  Text({
    parent: playButton,
    name: "btn_play_text_" + playerId,
    size: [buttonWidth, buttonHeight],
    position: [0, 0],
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.None,
    textColor: [1, 1, 1],
    textAnchor: mod.UIAnchor.Center,
    label: mod.Message("PLAY"),
    textSize: 28,
  });

  // Create "EXPLORE" button with onClick handler
  const exploreButton = Button({
    parent: container,
    name: "btn_explore_" + playerId,
    size: [buttonWidth, buttonHeight],
    position: [buttonWidth / 2 + buttonSpacing / 2, 60],
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.Solid,
    bgColor: [0.2, 0.4, 0.8],
    bgAlpha: 0.9,
    colorBase: [0.2, 0.4, 0.8],
    alphaBase: 1,
    colorHover: [0.3, 0.5, 1],
    alphaHover: 1,
    colorPressed: [0.1, 0.2, 0.5],
    alphaPressed: 1,
    onClick: (player) => handlePlayerChoice(player, PlayerChoice.Explore),
  });

  // Explore button text
  Text({
    parent: exploreButton,
    name: "btn_explore_text_" + playerId,
    size: [buttonWidth, buttonHeight],
    position: [0, 0],
    anchor: mod.UIAnchor.Center,
    bgFill: mod.UIBgFill.None,
    textColor: [1, 1, 1],
    textAnchor: mod.UIAnchor.Center,
    label: mod.Message("EXPLORE"),
    textSize: 28,
  });

  console.log("Welcome UI created");

  // Set UI depth to appear above the deployment/class selection screen
  mod.SetUIWidgetDepth(container, mod.UIDepth.AboveGameUI);
  mod.SetUIWidgetVisible(container, true);
  mod.SetUIWidgetDepth(playButton, mod.UIDepth.AboveGameUI);
  mod.SetUIWidgetVisible(playButton, true);
  mod.SetUIWidgetDepth(exploreButton, mod.UIDepth.AboveGameUI);
  mod.SetUIWidgetVisible(exploreButton, true);

  console.log("UI depth and visibility configured");
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
  handleButtonClick(eventPlayer, eventUIWidget, eventUIButtonEvent);
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
