import { ParseUI } from "modlib";
import { Players } from "../players";

const playerModeSelectors = new Map<number, ModeSelector>();

export class ModeSelector {
  player: mod.Player;
  headerWidget: mod.UIWidget | undefined;
  closeWidget: mod.UIWidget | undefined;

  constructor(player: mod.Player) {
    this.player = player;

    const btnOne = ModeSelector.getButton(
      "option_1",
      mod.UIAnchor.TopCenter,
      [100, 50]
    );
    const btnTwo = ModeSelector.getButton(
      "option_2",
      mod.UIAnchor.BottomCenter,
      [100, 50]
    );
    this.headerWidget = ParseUI({
      type: "Container",
      size: [200, 400],
      position: [0, 50],
      name: "header",
      anchor: mod.UIAnchor.TopCenter,
      bgFill: mod.UIBgFill.Solid,
      bgColor: [0, 0, 0],
      bgAlpha: 1,
      playerId: this.player,
      visible: false,
      children: [btnOne.btn, btnOne.label, btnTwo.btn, btnTwo.label],
    });

    const closeBtn = ModeSelector.getButton(
      "close",
      mod.UIAnchor.TopRight,
      [50, 50]
    );
    this.closeWidget = ParseUI({
      type: "Container",
      size: [50, 50],
      position: [0, 50],
      name: "close_ui",
      anchor: mod.UIAnchor.TopRight,
      bgFill: mod.UIBgFill.Solid,
      bgColor: [0, 0, 0],
      bgAlpha: 1,
      playerId: this.player,
      visible: false,
      children: [closeBtn.btn, closeBtn.label],
    });

    this.loop();
    playerModeSelectors.set(Players.getId(player), this);
  }

  async loop() {
    while (true) {
      if (this.headerWidget && this.closeWidget) {
        if (
          mod.GetSoldierState(this.player, mod.SoldierStateBool.IsReloading)
        ) {
          mod.SetUIWidgetVisible(this.headerWidget, true);
          mod.SetUIWidgetVisible(this.closeWidget, true);
          mod.EnableUIInputMode(true, this.player);
        }
      }
      await mod.Wait(0.1);
    }
  }

  static OnPlayerUIButtonEvent(
    eventPlayer: mod.Player,
    eventUIWidget: mod.UIWidget,
    eventUIButtonEvent: mod.UIButtonEvent
  ) {
    const modeSelector = playerModeSelectors.get(Players.getId(eventPlayer));
    if (!modeSelector) {
      console.log(
        "No ModeSelector found for player",
        mod.Message(eventPlayer.toString())
      );
      return;
    }
    modeSelector.handleButtonEvent(eventUIWidget, eventUIButtonEvent);
  }

  handleButtonEvent(widget: mod.UIWidget, event: mod.UIButtonEvent) {
    const name = mod.GetUIWidgetName(widget);
    switch (name) {
      case "button_option_1":
      case "button_option_2":
      case "button_close_2":
        mod.DisplayNotificationMessage(
          mod.Message("ui.messages.pressed", `ui.buttons.${name}`),
          this.player
        );
        break;
      default:
        mod.DisplayNotificationMessage(
          mod.Message("ui.messages.errors.invalid_button"),
          this.player
        );
        break;
    }

    if (name == "button_close") {
      if (this.headerWidget && this.closeWidget) {
        mod.EnableUIInputMode(false, this.player);
        mod.SetUIWidgetVisible(this.headerWidget, false);
        mod.SetUIWidgetVisible(this.closeWidget, false);
      }
    }
  }

  static getButton(name: string, anchor: mod.UIAnchor, size: number[]) {
    return {
      btn: {
        type: "Button",
        name: "button_" + name,
        size: size,
        position: [0, 0],
        anchor: anchor,
        bgFill: mod.UIBgFill.Solid,
        bgAlpha: 1,
        buttonEnabled: true,
        buttonColorBase: [0, 0, 0],
      },
      label: {
        type: "Text",
        parent: "button_" + name,
        name: "button_" + name + "_label",
        size: size,
        position: [0, 0],
        anchor: anchor,
        bgFill: mod.UIBgFill.None,
        textColor: [1, 1, 1],
        textAnchor: mod.UIAnchor.Center,
        textLabel: mod.Message(`ui.buttons.button_${name}`),
        textSize: 35,
      },
    };
  }
}
