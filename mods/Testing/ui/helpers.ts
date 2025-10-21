/**
 * Internal helper functions for the UI system
 */

import type { UIColor, UIPosition, UISize } from "./types";

let __uniqueIdCounter = 0;

let names: string[] = [];

export function generateUniqueName(name?: string): string {
  const generatedName =
    "__ui_widget_" +
    ++__uniqueIdCounter +
    "_" +
    Date.now() +
    (name ? "_" + name : "");
  names.push(generatedName);
  return generatedName;
}

export function asModVector(param: UIColor | UIPosition | UISize): mod.Vector {
  if (Array.isArray(param)) {
    return mod.CreateVector(
      param[0] ?? 0,
      param[1] ?? 0,
      param.length >= 3 ? param[2] ?? 0 : 0
    );
  }
  return param;
}

export function asModMessage(param: string | mod.Message): mod.Message {
  if (typeof param === "string") {
    return mod.Message(param);
  }
  return param;
}

export function findWidget(uniqueName: string): mod.UIWidget {
  const widget = mod.FindUIWidgetWithName(uniqueName);
  if (!widget) {
    console.log("names", names.join(", "));
    throw new Error(
      `Failed to find UI widget with unique name: ${uniqueName}. Widget creation may have failed.`
    );
  }
  return widget;
}

export function setWidgetName(widget: mod.UIWidget, name: string): void {
  mod.SetUIWidgetName(widget, name);
}

export function setNameAndGetWidget(name: string) {
  let widget = mod.FindUIWidgetWithName(name) as mod.UIWidget;
  mod.SetUIWidgetName(widget, name);
  return widget;
}
