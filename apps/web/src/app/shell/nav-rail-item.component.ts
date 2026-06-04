import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { FocusableOption } from '@angular/cdk/a11y';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

/**
 * One navigation-rail destination. Hand-built from the library's interaction
 * primitives (state layer + ripple + focus ring) because M3 navigation
 * components are not yet published (acknowledged gap, Decision 2A). Implements
 * CDK's {@link FocusableOption} so the rail can drive a roving tab stop with
 * `createRovingFocus` — exactly one item is tabbable at a time.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[appNavItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  template: '<ng-content />',
  host: {
    class: 'shell-rail-item',
    '[attr.tabindex]': 'tabindex()',
  },
})
export class NavRailItemComponent implements FocusableOption {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Used by the roving manager's type-ahead. */
  readonly label = input('');

  protected readonly tabindex = signal(-1);

  focus(): void {
    this.host.nativeElement.focus();
  }

  /** Mirror the roving manager's active index onto the tab stop. */
  setActive(active: boolean): void {
    this.tabindex.set(active ? 0 : -1);
  }

  getLabel(): string {
    return this.label();
  }
}
