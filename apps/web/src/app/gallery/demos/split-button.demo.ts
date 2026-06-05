import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CdkMenu } from '@angular/cdk/menu';
import { SplitButtonComponent } from '@ngguide/ui/split-button';
import { MenuDirective, MenuItemComponent } from '@ngguide/ui/menu';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Split button demo for the component vitrine.
 *
 * Exercises every M3 configuration the implemented `gui-split-button` supports:
 * the four color styles (elevated / filled / tonal / outlined), the five sizes
 * (xs / sm / md / lg / xl) which also drive the per-size inner-corner radius
 * ("Shapes" block), and the persistent `selected` trailing state. Each
 * specimen wires a real `<ng-template>` menu panel (`cdkMenu` + styled
 * `gui-menu-item`s) so the trailing button actually opens a menu and the open
 * state morph / icon spin can be observed.
 *
 * Note: the component intentionally exposes no `disabled` input — M3 lists a
 * disabled state, but the implemented `gui-split-button` has only
 * `variant` / `size` / `triggerLabel` / `selected` inputs and an `action`
 * output, so a disabled specimen is not representable through the public API.
 */
@Component({
  selector: 'app-demo-split-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    SplitButtonComponent,
    CdkMenu,
    MenuDirective,
    MenuItemComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="Split button"
      entry="@ngguide/ui/split-button"
      docHref="https://m3.material.io/components/split-button"
    >
      <app-demo-block
        heading="Variants"
        hint="Four M3 color styles — elevated, filled, tonal, outlined"
      >
        @for (v of variants; track v) {
          <app-demo-specimen [label]="v">
            <gui-split-button [variant]="v" (action)="lastAction.set(v)">
              <span guiLeading>Save</span>
              <gui-icon class="sym" guiTrailingIcon>keyboard_arrow_down</gui-icon>
              <ng-template>
                <div gui-menu cdkMenu>
                  <button gui-menu-item>Save as…</button>
                  <button gui-menu-item>Save all</button>
                  <button gui-menu-item>Save a copy</button>
                </div>
              </ng-template>
            </gui-split-button>
          </app-demo-specimen>
        }
      </app-demo-block>

      <app-demo-block
        heading="Sizes"
        hint="Five M3 sizes — xs, sm, md, lg, xl (filled)"
      >
        @for (s of sizes; track s) {
          <app-demo-specimen [label]="s">
            <gui-split-button
              variant="filled"
              [size]="s"
              (action)="lastAction.set('filled ' + s)"
            >
              <span guiLeading>Watch</span>
              <gui-icon class="sym" guiTrailingIcon>keyboard_arrow_down</gui-icon>
              <ng-template>
                <div gui-menu cdkMenu>
                  <button gui-menu-item>Watch later</button>
                  <button gui-menu-item>Add to queue</button>
                </div>
              </ng-template>
            </gui-split-button>
          </app-demo-specimen>
        }
      </app-demo-block>

      <app-demo-block
        heading="Shapes"
        hint="Inner-corner radius scales with size — xs/sm/md 4dp, lg 8dp, xl 12dp"
      >
        @for (s of sizes; track s) {
          <app-demo-specimen [label]="s + ' inner corner'">
            <gui-split-button
              variant="tonal"
              [size]="s"
              (action)="lastAction.set('tonal ' + s)"
            >
              <span guiLeading>Edit</span>
              <gui-icon class="sym" guiTrailingIcon>keyboard_arrow_down</gui-icon>
              <ng-template>
                <div gui-menu cdkMenu>
                  <button gui-menu-item>Rename</button>
                  <button gui-menu-item>Duplicate</button>
                </div>
              </ng-template>
            </gui-split-button>
          </app-demo-specimen>
        }
      </app-demo-block>

      <app-demo-block
        heading="States"
        hint="Unselected vs persistent selected trailing state (color is unchanged — only a state layer + centered icon). Open the trailing menu to see the open morph + icon spin."
      >
        @for (v of variants; track v) {
          <app-demo-specimen [label]="v + ' · unselected'">
            <gui-split-button [variant]="v" (action)="lastAction.set(v)">
              <span guiLeading>Share</span>
              <gui-icon class="sym" guiTrailingIcon>keyboard_arrow_down</gui-icon>
              <ng-template>
                <div gui-menu cdkMenu>
                  <button gui-menu-item>Copy link</button>
                  <button gui-menu-item>Embed</button>
                </div>
              </ng-template>
            </gui-split-button>
          </app-demo-specimen>
          <app-demo-specimen [label]="v + ' · selected'">
            <gui-split-button
              [variant]="v"
              selected
              triggerLabel="More share options"
              (action)="lastAction.set(v)"
            >
              <span guiLeading>Share</span>
              <gui-icon class="sym" guiTrailingIcon>keyboard_arrow_down</gui-icon>
              <ng-template>
                <div gui-menu cdkMenu>
                  <button gui-menu-item>Copy link</button>
                  <button gui-menu-item>Embed</button>
                </div>
              </ng-template>
            </gui-split-button>
          </app-demo-specimen>
        }
      </app-demo-block>

      <app-demo-block
        heading="Anatomy"
        hint="Leading button = primary action (icon + label); trailing button = menu trigger. Click the leading half or open the menu."
      >
        <app-demo-specimen label="icon + label">
          <gui-split-button
            variant="elevated"
            size="md"
            triggerLabel="More edit options"
            (action)="lastAction.set('edit')"
          >
            <span guiLeading
              ><gui-icon class="sym">edit</gui-icon>&nbsp;Edit</span
            >
            <gui-icon class="sym" guiTrailingIcon>keyboard_arrow_down</gui-icon>
            <ng-template>
              <div gui-menu cdkMenu>
                <button gui-menu-item>
                  <gui-icon class="sym" guiMenuItemLeading>content_cut</gui-icon>
                  Cut
                </button>
                <button gui-menu-item>
                  <gui-icon class="sym" guiMenuItemLeading>content_copy</gui-icon>
                  Copy
                </button>
                <button gui-menu-item>
                  <gui-icon class="sym" guiMenuItemLeading>content_paste</gui-icon>
                  Paste
                </button>
              </div>
            </ng-template>
          </gui-split-button>
        </app-demo-specimen>

        @if (lastAction()) {
          <app-demo-specimen [label]="'last action → ' + lastAction()">
            <gui-icon class="sym">touch_app</gui-icon>
          </app-demo-specimen>
        }
      </app-demo-block>
    </app-demo-component>
  `,
})
export class SplitButtonDemo {
  /** Four M3 split-button color styles (no `text`). */
  protected readonly variants = [
    'elevated',
    'filled',
    'tonal',
    'outlined',
  ] as const;

  /** Five M3 sizes. */
  protected readonly sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  /** Most recent leading-action emission, surfaced so the wiring is observable. */
  protected readonly lastAction = signal('');
}
