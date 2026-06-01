import {
  AfterViewInit,
  Component,
  ElementRef,
  viewChildren,
} from '@angular/core';
import {
  FocusKeyManager,
  FocusableOption,
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
  createRovingFocus,
} from '@ngguide/ui/interaction';

/**
 * Playground for the M3 interaction foundation. Provides a manual/browser test
 * target (spec:test via agent-browser) for the state layer, ripple, focus ring,
 * the aria-disabled suppression path, and a generic roving-tabindex toolbar.
 * Not published — `apps/web` is the demo host.
 */
@Component({
  selector: 'app-interaction-demo',
  imports: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  template: `
    <div class="flex flex-col gap-4">
      <span class="text-sm">Interaction foundation:</span>

      <!-- All three primitives composed on one interactive element. -->
      <div class="flex flex-row gap-4 items-center">
        <button
          guiStateLayer
          guiRipple
          guiFocusRing
          class="px-4 py-2 rounded-full border text-primary"
        >
          State layer + ripple + focus ring
        </button>

        <!-- aria-disabled variant: feedback is fully suppressed (Req 4). -->
        <button
          guiStateLayer
          guiRipple
          guiFocusRing
          aria-disabled="true"
          class="px-4 py-2 rounded-full border text-primary"
        >
          aria-disabled (no feedback)
        </button>
      </div>

      <!-- Generic roving-tabindex toolbar (one tab stop; arrows move focus). -->
      <div
        role="toolbar"
        aria-label="Roving tabindex demo"
        class="flex flex-row gap-2"
      >
        @for (item of toolbarItems; track item; let i = $index) {
          <button
            #rovingItem
            guiStateLayer
            guiRipple
            guiFocusRing
            [attr.tabindex]="i === 0 ? 0 : -1"
            (keydown)="onToolbarKeydown($event)"
            class="px-3 py-2 rounded-md border text-primary"
          >
            {{ item }}
          </button>
        }
      </div>
    </div>
  `,
})
export class InteractionDemoComponent implements AfterViewInit {
  readonly toolbarItems = ['One', 'Two', 'Three'];

  private readonly rovingItems =
    viewChildren<ElementRef<HTMLButtonElement>>('rovingItem');
  private manager?: FocusKeyManager<FocusableOption>;

  ngAfterViewInit(): void {
    const options: FocusableOption[] = this.rovingItems().map((ref) => ({
      focus: () => ref.nativeElement.focus(),
      getLabel: () => ref.nativeElement.textContent?.trim() ?? '',
    }));
    this.manager = createRovingFocus(options, { orientation: 'horizontal' });
    this.manager.setFirstItemActive();
  }

  onToolbarKeydown(event: KeyboardEvent): void {
    this.manager?.onKeydown(event);
  }
}
