/**
 * Button Component
 * Interactive button with customizable states and click handlers
 */

import { asModVector, findWidget, generateUniqueName } from "../helpers";
import type { BaseProps, UIColor } from "../types";

// Store button click handlers
const buttonHandlers = new Map<mod.UIWidget, (player: mod.Player) => void>();

/**********************************************************************************************************
 *   TYPE DEFINITIONS
 **********************************************************************************************************/
export namespace Button {
  /**
   * Button component properties
   */
  export type Props = BaseProps & {
    /** Whether the button is enabled */
    enabled?: boolean;
    /** Base state color */
    colorBase?: UIColor;
    /** Base state alpha */
    alphaBase?: number;
    /** Disabled state color */
    colorDisabled?: UIColor;
    /** Disabled state alpha */
    alphaDisabled?: number;
    /** Pressed state color */
    colorPressed?: UIColor;
    /** Pressed state alpha */
    alphaPressed?: number;
    /** Hover state color */
    colorHover?: UIColor;
    /** Hover state alpha */
    alphaHover?: number;
    /** Focused state color */
    colorFocused?: UIColor;
    /** Focused state alpha */
    alphaFocused?: number;
    /** Click handler called when button is pressed */
    onClick?: (player: mod.Player) => void;
  };

  /**
   * Button component type
   */
  export type Component = (props: Props) => mod.UIWidget;
}

/**********************************************************************************************************
 *   COMPONENT
 **********************************************************************************************************/
export const Button: Button.Component = (props) => {
  const finalName = generateUniqueName(props.name);

  const position = props.position
    ? asModVector(props.position)
    : mod.CreateVector(0, 0, 0);
  const size = props.size
    ? asModVector(props.size)
    : mod.CreateVector(100, 100, 0);
  const anchor = props.anchor ?? mod.UIAnchor.TopLeft;
  const parent = props.parent ?? mod.GetUIRoot();
  const visible = props.visible ?? true;
  const padding = props.padding ?? 8;
  const bgColor = props.bgColor
    ? asModVector(props.bgColor)
    : mod.CreateVector(0.25, 0.25, 0.25);
  const bgAlpha = props.bgAlpha ?? 0.5;
  const bgFill = props.bgFill ?? mod.UIBgFill.Solid;
  const buttonEnabled = props.enabled ?? true;
  const buttonColorBase = props.colorBase
    ? asModVector(props.colorBase)
    : mod.CreateVector(0.7, 0.7, 0.7);
  const buttonAlphaBase = props.alphaBase ?? 1;
  const buttonColorDisabled = props.colorDisabled
    ? asModVector(props.colorDisabled)
    : mod.CreateVector(0.2, 0.2, 0.2);
  const buttonAlphaDisabled = props.alphaDisabled ?? 0.5;
  const buttonColorPressed = props.colorPressed
    ? asModVector(props.colorPressed)
    : mod.CreateVector(0.25, 0.25, 0.25);
  const buttonAlphaPressed = props.alphaPressed ?? 1;
  const buttonColorHover = props.colorHover
    ? asModVector(props.colorHover)
    : mod.CreateVector(1, 1, 1);
  const buttonAlphaHover = props.alphaHover ?? 1;
  const buttonColorFocused = props.colorFocused
    ? asModVector(props.colorFocused)
    : mod.CreateVector(1, 1, 1);
  const buttonAlphaFocused = props.alphaFocused ?? 1;
  const receiver = props.teamId ?? props.playerId;

  if (receiver) {
    mod.AddUIButton(
      finalName,
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
      buttonAlphaFocused,
      receiver
    );
  } else {
    mod.AddUIButton(
      finalName,
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
  }

  const widget = findWidget(finalName);
  mod.SetUIWidgetName(widget, finalName);

  // Store onClick handler if provided
  if (props.onClick) {
    buttonHandlers.set(widget, props.onClick);
  }

  return widget;
};

/**
 * Handle button click events
 * Call this from your OnPlayerUIButtonEvent handler
 *
 * @param player The player who clicked the button
 * @param widget The button widget that was clicked
 * @param event The button event type
 * @returns true if the event was handled, false otherwise
 *
 * @example
 * ```ts
 * export function OnPlayerUIButtonEvent(
 *   eventPlayer: mod.Player,
 *   eventUIWidget: mod.UIWidget,
 *   eventUIButtonEvent: mod.UIButtonEvent
 * ): void {
 *   handleButtonClick(eventPlayer, eventUIWidget, eventUIButtonEvent);
 * }
 * ```
 */
export function handleButtonClick(
  player: mod.Player,
  widget: mod.UIWidget,
  event: mod.UIButtonEvent
): boolean {
  if (event === mod.UIButtonEvent.ButtonUp) {
    const handler = buttonHandlers.get(widget);
    if (handler) {
      handler(player);
      return true;
    }
  }
  return false;
}
