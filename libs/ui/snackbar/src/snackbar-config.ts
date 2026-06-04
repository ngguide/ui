import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export type GuiSnackbarCloseReason =
  | 'action'
  | 'dismiss'
  | 'timeout'
  | 'programmatic';

export interface GuiSnackbarConfig {
  message: string;
  /** Optional single action affordance. */
  action?: string;
  /** Show a trailing close (dismiss) icon. */
  showClose?: boolean;
  /**
   * Auto-dismiss after ms. `null` disables auto-dismiss. Per M3, actionable
   * snackbars shouldn't auto-dismiss: when an `action` is set and `duration`
   * is omitted, auto-dismiss is disabled automatically. Otherwise defaults to
   * an M3-aligned duration.
   */
  duration?: number | null;
  /** Force two-line layout; otherwise inferred from content length. */
  twoLine?: boolean;
  /** Lift above a bottom-anchored FAB. `true` ⇒ default offset, string ⇒ explicit offset. */
  aboveFab?: boolean | string;
}

export interface GuiSnackbarRef {
  /** Emits once with the reason when the snackbar closes. */
  readonly afterDismissed: Observable<GuiSnackbarCloseReason>;
  /** Emits when the action is activated. */
  readonly onAction: Observable<void>;
  dismiss(reason?: GuiSnackbarCloseReason): void;
}

/** Default auto-dismiss duration (ms) when `duration` is omitted. M3-aligned. */
export const GUI_SNACKBAR_DEFAULT_DURATION = 5000;

/**
 * Resolve the effective auto-dismiss duration (ms), or `null` for no auto-dismiss.
 *
 * M3: "Actionable snackbars shouldn't auto-dismiss." So when `duration` is omitted
 * and the snackbar carries an `action`, auto-dismiss is disabled; otherwise the
 * M3-aligned default applies. An explicit `duration` (including `null`) always wins.
 * Pure and deterministic.
 */
export function resolveSnackbarDuration(
  config: GuiSnackbarConfig,
): number | null {
  if (config.duration !== undefined) {
    return config.duration;
  }
  return config.action ? null : GUI_SNACKBAR_DEFAULT_DURATION;
}

/** Heuristic threshold (chars) above which a single-action snackbar wraps to two lines. */
export const GUI_SNACKBAR_TWO_LINE_THRESHOLD = 50;

/** Resolved, defaults-applied data handed to the surface component. */
export interface GuiSnackbarData {
  message: string;
  action?: string;
  showClose: boolean;
  twoLine: boolean;
}

/** Surface → service callbacks (provided to the surface via DI). */
export interface GuiSnackbarController {
  activateAction(): void;
  dismiss(reason?: GuiSnackbarCloseReason): void;
}

export const GUI_SNACKBAR_DATA = new InjectionToken<GuiSnackbarData>(
  'GUI_SNACKBAR_DATA',
);
export const GUI_SNACKBAR_CONTROLLER =
  new InjectionToken<GuiSnackbarController>('GUI_SNACKBAR_CONTROLLER');

/**
 * Normalize a `string | GuiSnackbarConfig` into resolved surface data. Pure and
 * deterministic — no side effects, no `Date.now`/`Math.random`.
 */
export function normalizeSnackbarConfig(
  config: GuiSnackbarConfig | string,
): { config: GuiSnackbarConfig; data: GuiSnackbarData } {
  const cfg: GuiSnackbarConfig =
    typeof config === 'string' ? { message: config } : config;
  const twoLine = inferTwoLine(cfg);
  return {
    config: cfg,
    data: {
      message: cfg.message,
      action: cfg.action,
      showClose: cfg.showClose ?? false,
      twoLine,
    },
  };
}

/** Deterministic two-line inference: explicit `twoLine` wins, else length-based. */
export function inferTwoLine(config: GuiSnackbarConfig): boolean {
  if (config.twoLine !== undefined) {
    return config.twoLine;
  }
  return config.message.length > GUI_SNACKBAR_TWO_LINE_THRESHOLD;
}
