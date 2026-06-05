import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FabMenuComponent,
  FabMenuItemComponent,
  FabMenuListComponent,
  GuiFabMenuColor,
} from '@ngguide/ui/fab-menu';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 FAB menu (`@ngguide/ui/fab-menu`).
 *
 * The FAB menu is a single-variant component: one menu size that pairs with any
 * FAB, opened by a 56dp close button that morphs from the resting FAB. The
 * implemented `FabMenuComponent` exposes a single `color: GuiFabMenuColor` input
 * — one of the three M3 color sets (primary / secondary / tertiary); each set is
 * a contrasting pair, tonal close button + vibrant items — plus an `ariaLabel`.
 * The menu panel is the consumer's `<ng-template>` carrying a
 * `<gui-fab-menu-list [color]>` (which hosts `CdkMenu` as a host directive); its
 * items are individual elevated pills floating above the close button. Each
 * block clicks the FAB to open its live menu.
 */
@Component({
  selector: 'app-demo-fab-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    FabMenuComponent,
    FabMenuItemComponent,
    FabMenuListComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="FAB menu"
      entry="@ngguide/ui/fab-menu"
      docHref="https://m3.material.io/components/fab-menu"
    >
      <!-- The three M3 color sets (primary / secondary / tertiary). Each set is
           a contrasting pair: the close button (FAB) takes the tonal
           *-container half, the items take the vibrant * half. -->
      <app-demo-block
        heading="Color sets"
        hint="Three M3 sets — tonal close button + vibrant items. Click a FAB to open."
      >
        @for (color of colors; track color) {
          <app-demo-specimen [label]="color">
            <gui-fab-menu [color]="color" ariaLabel="Compose">
              <gui-icon guiFabIcon class="sym">edit</gui-icon>
              <ng-template>
                <gui-fab-menu-list [color]="color">
                  <button gui-fab-menu-item>
                    <gui-icon guiMenuItemLeading class="sym">share</gui-icon>
                    Share
                  </button>
                  <button gui-fab-menu-item>
                    <gui-icon guiMenuItemLeading class="sym">link</gui-icon>
                    Add link
                  </button>
                  <button gui-fab-menu-item>
                    <gui-icon guiMenuItemLeading class="sym">edit</gui-icon>
                    Edit
                  </button>
                </gui-fab-menu-list>
              </ng-template>
            </gui-fab-menu>
          </app-demo-specimen>
        }
      </app-demo-block>

      <!-- Anatomy: close button (the 56dp FAB) + up to six menu items. M3:
           "The FAB menu can have up to six items." Items carry a leading icon
           plus the UI text label, per the menu-item labelling guidance. -->
      <app-demo-block
        heading="Anatomy"
        hint="Close button + up to six menu items, each with a leading icon and label."
      >
        <app-demo-specimen label="six items">
          <gui-fab-menu color="primary" ariaLabel="Create">
            <gui-icon guiFabIcon class="sym">add</gui-icon>
            <ng-template>
              <gui-fab-menu-list color="primary">
                <button gui-fab-menu-item>
                  <gui-icon guiMenuItemLeading class="sym">add_photo_alternate</gui-icon>
                  Photo
                </button>
                <button gui-fab-menu-item>
                  <gui-icon guiMenuItemLeading class="sym">videocam</gui-icon>
                  Video
                </button>
                <button gui-fab-menu-item>
                  <gui-icon guiMenuItemLeading class="sym">mic</gui-icon>
                  Audio
                </button>
                <button gui-fab-menu-item>
                  <gui-icon guiMenuItemLeading class="sym">description</gui-icon>
                  Document
                </button>
                <button gui-fab-menu-item>
                  <gui-icon guiMenuItemLeading class="sym">location_on</gui-icon>
                  Location
                </button>
                <button gui-fab-menu-item>
                  <gui-icon guiMenuItemLeading class="sym">event</gui-icon>
                  Event
                </button>
              </gui-fab-menu-list>
            </ng-template>
          </gui-fab-menu>
        </app-demo-specimen>

        <app-demo-specimen label="label only">
          <gui-fab-menu color="secondary" ariaLabel="Sort">
            <gui-icon guiFabIcon class="sym">sort</gui-icon>
            <ng-template>
              <gui-fab-menu-list color="secondary">
                <button gui-fab-menu-item>Newest first</button>
                <button gui-fab-menu-item>Oldest first</button>
                <button gui-fab-menu-item>By name</button>
              </gui-fab-menu-list>
            </ng-template>
          </gui-fab-menu>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Menu item states. The item is the shared M3 menu item: it supports a
           selected state (menuitemradio + checkmark cue) and a disabled state
           (owned by CdkMenuItem). Enabled / hovered / focused / pressed are the
           pointer states from the spec and are exercised live in the open menu. -->
      <app-demo-block
        heading="Item states"
        hint="Enabled (default), selected (checkmark cue), and disabled menu items."
      >
        <app-demo-specimen label="selected + disabled">
          <gui-fab-menu color="tertiary" ariaLabel="View options">
            <gui-icon guiFabIcon class="sym">tune</gui-icon>
            <ng-template>
              <gui-fab-menu-list color="tertiary">
                <button gui-fab-menu-item [selected]="true">List view</button>
                <button gui-fab-menu-item [guiMenuItemSelectable]="true">
                  Grid view
                </button>
                <button gui-fab-menu-item>Compact view</button>
                <button gui-fab-menu-item [disabled]="true">
                  <gui-icon guiMenuItemLeading class="sym">lock</gui-icon>
                  Archived (disabled)
                </button>
              </gui-fab-menu-list>
            </ng-template>
          </gui-fab-menu>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Scrolling: when the menu can scroll, items scroll within the panel
           while the close button (FAB) stays anchored and unobstructed (M3 a11y:
           "Allow the menu items to scroll behind the close button"). -->
      <app-demo-block
        heading="Scrolling"
        hint="Long menus scroll within the panel; the close button stays unobstructed."
      >
        <app-demo-specimen label="scrollable">
          <gui-fab-menu color="primary" ariaLabel="Apply label">
            <gui-icon guiFabIcon class="sym">label</gui-icon>
            <ng-template>
              <gui-fab-menu-list
                color="primary"
                style="--gui-fab-menu-max-height: 220px"
              >
                @for (label of manyLabels; track label) {
                  <button gui-fab-menu-item>
                    <gui-icon guiMenuItemLeading class="sym">label</gui-icon>
                    {{ label }}
                  </button>
                }
              </gui-fab-menu-list>
            </ng-template>
          </gui-fab-menu>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class FabMenuDemo {
  /** The three M3 color sets accepted by the FAB menu (GuiFabMenuColor). */
  protected readonly colors: GuiFabMenuColor[] = [
    'primary',
    'secondary',
    'tertiary',
  ];

  /** Deterministic label list for the scrolling specimen (no RNG/clock). */
  protected readonly manyLabels = [
    'Inbox',
    'Starred',
    'Important',
    'Sent',
    'Drafts',
    'Spam',
    'Trash',
    'Receipts',
    'Travel',
    'Work',
  ];
}
