import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

export type GuiCardVariant = 'elevated' | 'filled' | 'outlined';

/**
 * M3 card container — a contained surface grouping related content and actions.
 * Comes in three variants (Req 1.2): `elevated` (surface-container-low +
 * elevation level 1), `filled` (surface-container-highest, no elevation),
 * `outlined` (surface + 1dp outline-variant border). Corner is `medium`
 * (12dp). Content is projected; the card itself is non-interactive — pair it
 * with {@link GuiCardClickable} (whole-surface) or {@link GuiCardPrimaryAction}
 * (a sub-region) for actionable cards (Req 2).
 */
@Component({
  selector: 'gui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './card.css',
  host: {
    class: 'gui-card',
    '[attr.data-variant]': 'variant()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class GuiCard {
  /** Visual variant (Req 1.2). */
  readonly variant = input<GuiCardVariant>('elevated');
  /** Dim the card to 0.38 opacity and suppress interaction (Req 2.6). */
  readonly disabled = input(false, { transform: booleanAttribute });
}

/**
 * Whole-surface actionable card (Req 2.1, M3 actionable card "Variant A").
 * Apply to a `gui-card` (or an `<a gui-card>`) to make the entire surface a
 * single control. Adds the interaction foundation (state layer / ripple /
 * focus ring), keyboard activation (Enter/Space), and `role="button"` when the
 * host is not an anchor. Do NOT use on a card that contains its own buttons or
 * links — nest those interactions with {@link GuiCardPrimaryAction} instead
 * (Req 2.3).
 */
@Directive({
  selector: '[guiCardClickable]',
  hostDirectives: [
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  host: {
    class: 'gui-card-clickable',
    '[attr.tabindex]': 'disabled() ? null : 0',
    '[attr.role]': 'isAnchor ? null : "button"',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '(click)': 'activate($event)',
    '(keydown.enter)': 'activate($event)',
    '(keydown.space)': 'activate($event)',
  },
})
export class GuiCardClickable {
  /** Mirror the card's disabled state so activation + state layers are suppressed (Req 2.6). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Emitted when the card is activated by click or keyboard (Req 2.1). */
  readonly cardActivate = output<Event>();

  protected readonly isAnchor =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'A';

  protected activate(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    if (event.type === 'keydown') {
      // Prevent the page scrolling on Space / activating twice.
      event.preventDefault();
    }
    this.cardActivate.emit(event);
  }
}

/**
 * Primary-action region of a card (Req 2.2, M3 actionable card "Variant B").
 * Use when a card has both a main tap target AND its own action buttons: wrap
 * the headline/media in this region; place the buttons OUTSIDE it so they
 * remain independently focusable (Req 2.4). Carries the interaction foundation
 * and keyboard activation, exposing `role="button"`.
 */
@Directive({
  selector: '[guiCardPrimaryAction]',
  hostDirectives: [
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  host: {
    class: 'gui-card-primary-action',
    '[attr.tabindex]': 'disabled() ? null : 0',
    role: 'button',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '(click)': 'activate($event)',
    '(keydown.enter)': 'activate($event)',
    '(keydown.space)': 'activate($event)',
  },
})
export class GuiCardPrimaryAction {
  /** Suppress activation + state layers when disabled (Req 2.6). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Emitted when the primary-action region is activated (Req 2.2). */
  readonly primaryAction = output<Event>();

  protected activate(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    if (event.type === 'keydown') {
      event.preventDefault();
    }
    this.primaryAction.emit(event);
  }
}
