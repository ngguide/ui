import { Injector, TemplateRef } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';

/**
 * Shared modal foundation for the containment overlay surfaces (dialog, modal
 * bottom sheet, modal side sheet). Each family builds on CDK's headless
 * `@angular/cdk/dialog` `Dialog` service for APG-complete modal behavior —
 * `aria-modal`, role, focus trap, focus restore, autofocus, Escape, and
 * scroll-lock (the CDK `Dialog` default scroll strategy is already
 * `block()`, satisfying Req 12.6 without an explicit override).
 */

/** Modal role exposed to assistive tech (Req 14.1). */
export type GuiDialogRole = 'dialog' | 'alertdialog';

/**
 * Common configuration accepted by every modal `open()` in the containment
 * category. Families extend this with their own layout options.
 */
export interface GuiModalConfigBase<D = unknown> {
  /** Data injected via {@link GUI_DIALOG_DATA} into the content component. */
  data?: D;
  /** ARIA role; defaults to `'dialog'`. Use `'alertdialog'` for confirmations. */
  role?: GuiDialogRole;
  /** Accessible name when no visible headline exists. */
  ariaLabel?: string;
  /** Id of the element naming the surface (e.g. the headline). */
  ariaLabelledBy?: string;
  /** When `true`, Escape and scrim-click do not close the surface (Req 12.4/12.5). */
  disableClose?: boolean;
  /** Extra class(es) applied to the overlay pane. */
  panelClass?: string | string[];
  /** Initial focus target; defaults to `'first-tabbable'`. */
  autoFocus?: 'dialog' | 'first-tabbable' | 'first-heading' | string;
  /** Restore focus to the opener on close; defaults to `true`. */
  restoreFocus?: boolean;
  /** Parent injector for the projected content. */
  injector?: Injector;
}

/**
 * Public handle returned by every modal `open()`. A thin, framework-agnostic
 * wrapper over CDK's {@link DialogRef} exposing only the members consumers need.
 */
export interface GuiDialogRef<R = unknown> {
  /** Emits the close result once, when the surface has closed. */
  readonly closed: Observable<R | undefined>;
  /** Emits when the scrim (backdrop) is clicked. */
  readonly backdropClick: Observable<MouseEvent>;
  /** Emits keydown events dispatched while the surface is focused. */
  readonly keydownEvents: Observable<KeyboardEvent>;
  /** Close the surface, optionally returning a result to `closed`. */
  close(result?: R): void;
}

/** Re-export of CDK's data token so content components inject it from `@ngguide/ui/overlay`. */
export const GUI_DIALOG_DATA = DIALOG_DATA;

/** What `open()` accepts as content: a component type or an inline template. */
export type GuiModalContent<C> = ComponentType<C> | TemplateRef<C>;

/** Normalize a value that may be a single class or an array into an array. */
export function asArray(value: string | string[] | undefined): string[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * The CDK `DialogConfig` fields the normalizer sets. Deliberately narrower than
 * `DialogConfig` — it omits the result-generic-dependent fields (`providers`,
 * `templateContext`) so it can be spread into a fully-typed
 * `DialogConfig<D, DialogRef<R, C>>` without provoking variance errors.
 */
export interface GuiNormalizedModalConfig<D = unknown> {
  role: GuiDialogRole;
  ariaModal: true;
  ariaLabel: string | null;
  ariaLabelledBy: string | null;
  disableClose: boolean;
  autoFocus: string;
  restoreFocus: boolean;
  hasBackdrop: true;
  backdropClass: string;
  data: D | null;
  injector: Injector | undefined;
  panelClass: string[];
}

/**
 * Map a {@link GuiModalConfigBase} onto the CDK `DialogConfig` fields, applying
 * the M3 modal defaults: `ariaModal: true`, a backdrop styled by the global
 * `.gui-scrim` class, `autoFocus: 'first-tabbable'`, and `restoreFocus: true`
 * (Req 12.1–12.3, 12.7, 14.1). Scroll-lock is left to CDK `Dialog`'s default
 * block scroll strategy (Req 12.6). Family-specific fields (`container`,
 * `panelClass`, position strategy) are layered on by each service afterwards.
 */
export function normalizeModalConfig<D = unknown>(
  config?: GuiModalConfigBase<D>,
): GuiNormalizedModalConfig<D> {
  return {
    role: config?.role ?? 'dialog',
    ariaModal: true,
    ariaLabel: config?.ariaLabel ?? null,
    ariaLabelledBy: config?.ariaLabelledBy ?? null,
    disableClose: config?.disableClose ?? false,
    autoFocus: config?.autoFocus ?? 'first-tabbable',
    restoreFocus: config?.restoreFocus ?? true,
    hasBackdrop: true,
    backdropClass: 'gui-scrim',
    data: config?.data ?? null,
    injector: config?.injector,
    panelClass: asArray(config?.panelClass),
  };
}

/** Wrap a CDK {@link DialogRef} in the narrower public {@link GuiDialogRef}. */
export function wrapDialogRef<R = unknown, C = unknown>(
  ref: DialogRef<R, C>,
): GuiDialogRef<R> {
  return {
    closed: ref.closed,
    backdropClick: ref.backdropClick,
    keydownEvents: ref.keydownEvents,
    close: (result?: R) => ref.close(result),
  };
}
