import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';
import { GuiSize } from '@ngguide/ui';

export type GuiIconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';
export type GuiIconButtonWidth = 'narrow' | 'default' | 'wide';
export type GuiIconButtonShape = 'round' | 'square';

@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-icon-button], button[guiIconButton], a[gui-icon-button], a[guiIconButton]',
  // The host <button>/<a> is the M3 *touch target* (a transparent frame); the
  // inner `.ib-container` is the *visible container* that carries the shape,
  // color, state layer and ripple. Separating them lets xs/sm keep their exact
  // M3 container size (32/40dp) while the host frame still meets the 48dp
  // accessible target. The interaction foundation (state layer + ripple) is
  // applied to the inner element so its overflow clips the ripple to the visible
  // pill, not the larger frame. The focus ring also belongs on the visible
  // container, but keyboard focus lands on the outer button — so the component
  // monitors the host (CDK FocusMonitor) and bridges the signal in as a class.
  template: `
    <span
      class="ib-container gui-focus-ring"
      guiStateLayer
      guiRipple
      [disabled]="disabled()"
      [class.gui-focus-visible]="focusVisible()"
    >
      <ng-content />
      <ng-content select="[guiSelectedIcon]" />
    </span>
  `,
  imports: [GuiStateLayerDirective, GuiRippleDirective],
  styleUrl: './icon-button.css',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-width]': 'width()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-toggle]': 'toggle() ? "" : null',
    '[attr.data-selected]': 'toggle() && selected() ? "" : null',
    '[attr.aria-pressed]': 'toggle() ? selected() : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[class.gui-disabled]': 'disabled()',
    // A linkless <a gui-icon-button> has no implicit button role and is not in
    // the tab order, so it needs a synthetic role + tabindex (and keyboard
    // activation) to be reachable/operable (M3 keyboard navigation).
    '[attr.role]': 'needsButtonRole ? "button" : null',
    '[attr.tabindex]': 'needsButtonRole ? (disabled() ? -1 : 0) : null',
    '(click)': 'onActivate($event)',
    '(keydown)': 'onKeydown($event)',
  },
  exportAs: 'guiIconButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  variant = input<GuiIconButtonVariant>('standard');
  size = input<GuiSize>('sm');
  width = input<GuiIconButtonWidth>('default');
  shape = input<GuiIconButtonShape>('round');
  disabled = input(false, { transform: booleanAttribute });
  toggle = input(false, { transform: booleanAttribute });
  selected = model(false);
  /**
   * Accessibility label describing the action (e.g. "Add to favorites"). Sets
   * `aria-label` as the assistive-technology name. On web, M3 recommends also
   * applying `guiTooltip` (from `@ngguide/ui/tooltip`) on the same element to
   * surface the label as a hover/focus tooltip.
   */
  label = input('');

  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly destroyRef = inject(DestroyRef);

  /** True when host is a <button> (native disabled) vs <a> (aria-disabled). */
  protected readonly isButton = this.host.tagName === 'BUTTON';

  /**
   * True for an anchor host with no href: such an <a> has no implicit button
   * role and is not focusable, so it needs a synthetic role + tabindex and
   * keyboard activation to be reachable/operable (M3 keyboard navigation).
   */
  protected readonly needsButtonRole =
    !this.isButton && !this.host.hasAttribute('href');

  /**
   * Keyboard-focus signal mirrored onto the inner container so the M3 focus
   * ring (and the focus state-layer tint) render on the *visible* container
   * rather than the transparent touch frame. The focusable element is the outer
   * button, so we monitor it with the same CDK {@link FocusMonitor} signal the
   * interaction foundation uses — keeping the ring in lock-step with programmatic
   * / roving focus, and SSR-safe (no class is toggled on the server).
   */
  protected readonly focusVisible = signal(false);

  constructor() {
    this.focusMonitor
      .monitor(this.host)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((origin: FocusOrigin) =>
        this.focusVisible.set(origin === 'keyboard'),
      );
    this.destroyRef.onDestroy(() => this.focusMonitor.stopMonitoring(this.host));
  }

  protected onActivate(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.toggle()) {
      this.selected.update((v) => !v);
    }
  }

  /**
   * Space/Enter activation for a linkless anchor host. Native <button> hosts and
   * real links already handle their own keyboard activation; Space is consumed
   * to prevent the page from scrolling (M3 keyboard navigation).
   */
  protected onKeydown(event: Event): void {
    if (!this.needsButtonRole || !(event instanceof KeyboardEvent)) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.host.click();
    }
  }
}
