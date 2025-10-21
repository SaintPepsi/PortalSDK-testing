/**
 * Container Component
 * Containers can hold child widgets and are used to group UI elements
 */

import { asModVector, findWidget, generateUniqueName } from "../helpers";
import type { BaseProps } from "../types";

/**********************************************************************************************************
 *   TYPE DEFINITIONS
 **********************************************************************************************************/
export namespace Container {
  /**
   * Container component properties
   */
  export type Props = BaseProps;

  /**
   * Container component type
   */
  export type Component = (props: Props) => mod.UIWidget;
}

/**********************************************************************************************************
 *   COMPONENT
 **********************************************************************************************************/
export const Container: Container.Component = (props) => {
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
  const padding = props.padding ?? 0;
  const bgColor = props.bgColor
    ? asModVector(props.bgColor)
    : mod.CreateVector(0.25, 0.25, 0.25);
  const bgAlpha = props.bgAlpha ?? 0.5;
  const bgFill = props.bgFill ?? mod.UIBgFill.Solid;
  const receiver = props.teamId ?? props.playerId;

  if (receiver) {
    mod.AddUIContainer(
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
      receiver
    );
  } else {
    mod.AddUIContainer(
      finalName,
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
  }

  const widget = findWidget(finalName);
  mod.SetUIWidgetName(widget, finalName);

  return widget;
};
