import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { GuiInteractionStyles } from './interaction-styles';
import { isHostDisabled } from './disabled';

/** What the directive writes to `data-gui-state`. */
export type GuiInteractionState = 'pressed' | 'dragged' | null;

/**
 * Renders the M3 state-layer overlay on an interactive host as a `::before`
 * pseudo-element (Decision 1A). Hover and focus opacities are pure CSS
 * (`:hover` / `:focus-visible` in {@link INTERACTION_CSS}); pressed and dragged
 * are tracked here in JS and exposed via `data-gui-state` for CSS to key off.
 * The overlay tints with the host content color and never affects layout
 * (Req 1.7, 1.9). Disabled hosts (input flag, native `disabled`, or
 * `aria-disabled`) produce no state layer (Req 4.1, 4.4).
 */
@Directive({
  selector: '[guiStateLayer]',
  host: {
    class: 'gui-state-layer',
    '[attr.data-gui-state]': 'stateAttr()',
    '[attr.data-gui-disabled]': 'isDisabled() || null',
    '(pointerdown)': 'onPressed(true)',
    '(pointerup)': 'onPressed(false)',
    '(pointercancel)': 'onPressed(false)',
    '(pointerleave)': 'onPressed(false)',
    '(dragstart)': 'onDragged(true)',
    '(dragend)': 'onDragged(false)',
  },
})
export class GuiStateLayerDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly styles = inject(GuiInteractionStyles);

  /** Explicit disabled flag; native `disabled`/`aria-disabled` are also honored. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly pressed = signal(false);
  private readonly dragged = signal(false);

  /**
   * Disabled when the input is set OR the host is natively disabled /
   * `aria-disabled` (Req 4.4). The input path is fully reactive (Req 4.5);
   * native attributes are additionally suppressed by CSS so the overlay always
   * tracks the DOM.
   */
  protected readonly isDisabled = computed(
    () => this.disabled() || isHostDisabled(this.host.nativeElement),
  );

  protected readonly stateAttr = computed<GuiInteractionState>(() => {
    if (this.isDisabled()) {
      return null;
    }
    if (this.dragged()) {
      return 'dragged';
    }
    if (this.pressed()) {
      return 'pressed';
    }
    return null;
  });

  constructor() {
    // Ensure the shared interaction stylesheet is present on first use.
    this.styles.ensure();
  }

  protected onPressed(value: boolean): void {
    this.pressed.set(value && !this.isDisabled());
  }

  protected onDragged(value: boolean): void {
    this.dragged.set(value && !this.isDisabled());
  }
}
