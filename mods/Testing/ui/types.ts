/**
 * Shared type definitions for the UI system
 */

export type UIColor = mod.Vector | [number, number, number];
export type UIPosition = mod.Vector | [number, number] | [number, number, number];
export type UISize = mod.Vector | [number, number] | [number, number, number];

/**
 * Base properties shared by all UI components
 */
export type BaseProps = {
  /** Unique name for the widget (optional, auto-generated if not provided) */
  name?: string;
  /** Position of the widget */
  position?: UIPosition;
  /** Size of the widget */
  size?: UISize;
  /** Anchor point for positioning */
  anchor?: mod.UIAnchor;
  /** Parent widget (defaults to UI root) */
  parent?: mod.UIWidget;
  /** Whether the widget is visible */
  visible?: boolean;
  /** Padding around the widget content */
  padding?: number;
  /** Background color */
  bgColor?: UIColor;
  /** Background alpha (0-1) */
  bgAlpha?: number;
  /** Background fill style */
  bgFill?: mod.UIBgFill;
  /** Restrict visibility to a specific player */
  playerId?: mod.Player;
  /** Restrict visibility to a specific team */
  teamId?: mod.Team;
};
