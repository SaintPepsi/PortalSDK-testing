/**
 * Image Component
 * Displays an image with customizable tinting
 */

import { asModVector, findWidget, generateUniqueName } from "../helpers";
import type { BaseProps, UIColor } from "../types";

/**********************************************************************************************************
 *   TYPE DEFINITIONS
 **********************************************************************************************************/
export namespace Image {
  /**
   * Image component properties
   */
  export type Props = BaseProps & {
    /** Type of image to display */
    imageType?: mod.UIImageType;
    /** Image tint color */
    imageColor?: UIColor;
    /** Image alpha (0-1) */
    imageAlpha?: number;
  };

  /**
   * Image component type
   */
  export type Component = (props: Props) => mod.UIWidget;
}

/**********************************************************************************************************
 *   COMPONENT
 **********************************************************************************************************/
export const Image: Image.Component = (props) => {
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
  const imageType = props.imageType ?? mod.UIImageType.None;
  const imageColor = props.imageColor
    ? asModVector(props.imageColor)
    : mod.CreateVector(1, 1, 1);
  const imageAlpha = props.imageAlpha ?? 1;
  const receiver = props.teamId ?? props.playerId;

  if (receiver) {
    mod.AddUIImage(
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
      imageType,
      imageColor,
      imageAlpha,
      receiver
    );
  } else {
    mod.AddUIImage(
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
      imageType,
      imageColor,
      imageAlpha
    );
  }

  const widget = findWidget(finalName);
  mod.SetUIWidgetName(widget, finalName);

  return widget;
};
