/**
 * Text Component
 * Displays text content with customizable styling
 */

import {
  asModMessage,
  asModVector,
  findWidget,
  generateUniqueName,
} from "../helpers";
import type { BaseProps, UIColor } from "../types";

/**********************************************************************************************************
 *   TYPE DEFINITIONS
 **********************************************************************************************************/
export namespace Text {
  /**
   * Text component properties
   */
  export type Props = BaseProps & {
    /** Text content to display (string or mod.Message) */
    label: string | mod.Message;
    /** Font size */
    textSize?: number;
    /** Text color */
    textColor?: UIColor;
    /** Text alpha (0-1) */
    textAlpha?: number;
    /** Text anchor point */
    textAnchor?: mod.UIAnchor;
  };

  /**
   * Text component type
   */
  export type Component = (props: Props) => mod.UIWidget;
}

/**********************************************************************************************************
 *   COMPONENT
 **********************************************************************************************************/
export const Text: Text.Component = (props) => {
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
  const textLabel = asModMessage(props.label);
  const textSize = props.textSize ?? 0;
  const textColor = props.textColor
    ? asModVector(props.textColor)
    : mod.CreateVector(1, 1, 1);
  const textAlpha = props.textAlpha ?? 1;
  const textAnchor = props.textAnchor ?? mod.UIAnchor.CenterLeft;
  const receiver = props.teamId ?? props.playerId;

  if (receiver) {
    mod.AddUIText(
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
      textLabel,
      textSize,
      textColor,
      textAlpha,
      textAnchor,
      receiver
    );
  } else {
    mod.AddUIText(
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
      textLabel,
      textSize,
      textColor,
      textAlpha,
      textAnchor
    );
  }

  const widget = findWidget(finalName);
  mod.SetUIWidgetName(widget, finalName);
  return widget;
};
