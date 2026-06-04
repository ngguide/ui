import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  MenuDirective,
  MenuItemComponent,
  MenuDividerComponent,
} from '@ngguide/ui/menu';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 menu (`@ngguide/ui/menu`).
 *
 * The menu is a pure styling layer over Angular CDK's `cdkMenu` / `cdkMenuItem`
 * / `cdkMenuTriggerFor`: `MenuDirective` (`[gui-menu]`) paints the surface from
 * three inputs — `variant` (`baseline` | `vertical`), `color` (`standard` |
 * `vibrant`), `layout` (`standard` | `grouped`) — driven onto the host as
 * `data-*` attributes. `MenuItemComponent` (`button[gui-menu-item]`) composes
 * `CdkMenuItem` plus the interaction foundation and exposes the M3 item slots
 * (leading / trailing icon, supporting two-line text, trailing text, badge) and
 * two boolean inputs, `selected` and `guiMenuItemSelectable`. `disabled` is
 * owned by `CdkMenuItem` (aliased onto the host). `MenuDividerComponent`
 * (`gui-menu-divider`) is the `role="separator"` rule.
 *
 * Each block wires a real `gui-button` / `gui-icon-button` trigger with
 * `cdkMenuTriggerFor` so the panel actually opens; every variant / color /
 * layout / item-state the implementation supports is shown.
 */
@Component({
  selector: 'app-demo-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    CdkMenu,
    CdkMenuTrigger,
    MenuDirective,
    MenuItemComponent,
    MenuDividerComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="Menu"
      entry="@ngguide/ui/menu"
      docHref="https://m3.material.io/components/menus"
    >
      <!-- VARIANTS — baseline (square, legacy) vs vertical (M3 Expressive,
           rounded). MenuDirective.variant. -->
      <app-demo-block
        heading="Variants"
        hint="Baseline (square corners, legacy) vs vertical (M3 Expressive, rounded). Click a trigger to open."
      >
        <app-demo-specimen label="baseline">
          <button gui-button variant="outlined" [cdkMenuTriggerFor]="baselineM">
            Baseline
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #baselineM>
            <div gui-menu variant="baseline" cdkMenu>
              <button gui-menu-item>Cut</button>
              <button gui-menu-item>Copy</button>
              <button gui-menu-item>Paste</button>
            </div>
          </ng-template>
        </app-demo-specimen>

        <app-demo-specimen label="vertical">
          <button gui-button variant="outlined" [cdkMenuTriggerFor]="verticalM">
            Vertical
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #verticalM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>Cut</button>
              <button gui-menu-item>Copy</button>
              <button gui-menu-item>Paste</button>
            </div>
          </ng-template>
        </app-demo-specimen>
      </app-demo-block>

      <!-- COLOR — standard (surface-based) vs vibrant (tertiary-based,
           Expressive only). MenuDirective.color, shown on the vertical
           variant where the selected item also adopts the vibrant role. -->
      <app-demo-block
        heading="Color styles"
        hint="Standard (surface-based) vs vibrant (tertiary-based, Expressive). Vibrant makes the selected item stand out."
      >
        <app-demo-specimen label="standard">
          <button
            gui-button
            variant="tonal"
            [cdkMenuTriggerFor]="standardColorM"
          >
            Standard
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #standardColorM>
            <div gui-menu variant="vertical" color="standard" cdkMenu>
              <button gui-menu-item [selected]="true">Relevance</button>
              <button gui-menu-item>Date</button>
              <button gui-menu-item>Rating</button>
            </div>
          </ng-template>
        </app-demo-specimen>

        <app-demo-specimen label="vibrant">
          <button
            gui-button
            variant="tonal"
            [cdkMenuTriggerFor]="vibrantColorM"
          >
            Vibrant
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #vibrantColorM>
            <div gui-menu variant="vertical" color="vibrant" cdkMenu>
              <button gui-menu-item [selected]="true">Relevance</button>
              <button gui-menu-item>Date</button>
              <button gui-menu-item>Rating</button>
            </div>
          </ng-template>
        </app-demo-specimen>
      </app-demo-block>

      <!-- LAYOUT — standard (flat list) vs grouped (spaced sections,
           Expressive only). MenuDirective.layout. -->
      <app-demo-block
        heading="Layouts"
        hint="Standard (flat list) vs grouped (extra spacing between sections, Expressive)."
      >
        <app-demo-specimen label="standard">
          <button
            gui-button
            variant="outlined"
            [cdkMenuTriggerFor]="standardLayoutM"
          >
            Standard
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #standardLayoutM>
            <div gui-menu variant="vertical" layout="standard" cdkMenu>
              <button gui-menu-item>Profile</button>
              <button gui-menu-item>Settings</button>
              <button gui-menu-item>Help</button>
              <button gui-menu-item>Sign out</button>
            </div>
          </ng-template>
        </app-demo-specimen>

        <app-demo-specimen label="grouped">
          <button
            gui-button
            variant="outlined"
            [cdkMenuTriggerFor]="groupedLayoutM"
          >
            Grouped
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #groupedLayoutM>
            <div gui-menu variant="vertical" layout="grouped" cdkMenu>
              <button gui-menu-item>Profile</button>
              <button gui-menu-item>Settings</button>
              <button gui-menu-item>Help</button>
              <button gui-menu-item>Sign out</button>
            </div>
          </ng-template>
        </app-demo-specimen>
      </app-demo-block>

      <!-- TRIGGERS — M3: menus can open from buttons, icon buttons, text
           fields, etc. Two representative trigger surfaces. -->
      <app-demo-block
        heading="Triggers"
        hint="A menu can open from any control — here a button and an icon button."
      >
        <app-demo-specimen label="button">
          <button gui-button variant="filled" [cdkMenuTriggerFor]="btnTriggerM">
            Actions
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #btnTriggerM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>Edit</button>
              <button gui-menu-item>Duplicate</button>
              <button gui-menu-item>Delete</button>
            </div>
          </ng-template>
        </app-demo-specimen>

        <app-demo-specimen label="icon button">
          <button
            gui-icon-button
            variant="standard"
            aria-label="More options"
            [cdkMenuTriggerFor]="iconTriggerM"
          >
            <gui-icon class="sym">more_vert</gui-icon>
          </button>
          <ng-template #iconTriggerM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>Edit</button>
              <button gui-menu-item>Duplicate</button>
              <button gui-menu-item>Delete</button>
            </div>
          </ng-template>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ITEM STATES — enabled (default), selected (menuitemradio +
           checkmark + shape/color morph), selectable-but-unselected, and
           disabled (CdkMenuItem-owned, aria-disabled). Hovered / focused /
           pressed are live pointer states once the panel is open. -->
      <app-demo-block
        heading="Item states"
        hint="Enabled, selected (checkmark + shape/color morph), selectable-unselected, and disabled. Hover/focus/press live in the open panel."
      >
        <app-demo-specimen label="enabled · selected · disabled">
          <button gui-button variant="outlined" [cdkMenuTriggerFor]="statesM">
            View
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #statesM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item [selected]="true">List view</button>
              <button gui-menu-item [guiMenuItemSelectable]="true">
                Grid view
              </button>
              <button gui-menu-item>Gallery view</button>
              <button gui-menu-item [disabled]="true">
                <gui-icon class="sym" guiMenuItemLeading>lock</gui-icon>
                Locked view
              </button>
            </div>
          </ng-template>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ANATOMY — every optional item slot: leading icon, label text,
           supporting (two-line) text, trailing text (e.g. a shortcut), badge,
           trailing icon, plus the divider. -->
      <app-demo-block
        heading="Anatomy & slots"
        hint="Leading icon, label, supporting text, trailing text (shortcut), badge, trailing icon, and divider."
      >
        <app-demo-specimen label="leading + trailing icon">
          <button gui-button variant="tonal" [cdkMenuTriggerFor]="iconsM">
            Icons
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #iconsM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>bookmark</gui-icon>
                Add to favorites
                <gui-icon class="sym" guiMenuItemTrailing>open_in_new</gui-icon>
              </button>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>share</gui-icon>
                Share
                <gui-icon class="sym" guiMenuItemTrailing>north_east</gui-icon>
              </button>
            </div>
          </ng-template>
        </app-demo-specimen>

        <app-demo-specimen label="trailing text (shortcut)">
          <button gui-button variant="tonal" [cdkMenuTriggerFor]="shortcutsM">
            Edit
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #shortcutsM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>content_cut</gui-icon>
                Cut
                <span guiMenuItemTrailingText>⌘X</span>
              </button>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>content_copy</gui-icon>
                Copy
                <span guiMenuItemTrailingText>⌘C</span>
              </button>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>content_paste</gui-icon>
                Paste
                <span guiMenuItemTrailingText>⌘V</span>
              </button>
            </div>
          </ng-template>
        </app-demo-specimen>

        <app-demo-specimen label="badge">
          <button gui-button variant="tonal" [cdkMenuTriggerFor]="badgesM">
            Inbox
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #badgesM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>inbox</gui-icon>
                Primary
                <span guiMenuItemBadge>12</span>
              </button>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>group</gui-icon>
                Social
                <span guiMenuItemBadge>3</span>
              </button>
            </div>
          </ng-template>
        </app-demo-specimen>

        <app-demo-specimen label="supporting (two-line) text">
          <button gui-button variant="tonal" [cdkMenuTriggerFor]="supportingM">
            Accounts
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #supportingM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>person</gui-icon>
                Jane Doe
                <span guiMenuItemSupporting>jane@example.com</span>
              </button>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>person</gui-icon>
                John Smith
                <span guiMenuItemSupporting>john@example.com</span>
              </button>
            </div>
          </ng-template>
        </app-demo-specimen>

        <app-demo-specimen label="divider">
          <button gui-button variant="tonal" [cdkMenuTriggerFor]="dividerM">
            File
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #dividerM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>New</button>
              <button gui-menu-item>Open</button>
              <gui-menu-divider />
              <button gui-menu-item>Save</button>
              <button gui-menu-item>Save as…</button>
              <gui-menu-divider />
              <button gui-menu-item>Print</button>
            </div>
          </ng-template>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SUBMENUS — M3 "active" state: a main item reveals a submenu via a
           nested cdkMenuTriggerFor. Hover/arrow-right to open the cascade. -->
      <app-demo-block
        heading="Submenus"
        hint="An item carrying a nested cdkMenuTriggerFor reveals a cascading submenu (M3 'active' state)."
      >
        <app-demo-specimen label="cascading submenu">
          <button gui-button variant="filled" [cdkMenuTriggerFor]="rootM">
            Share
            <gui-icon class="sym" guiIcon>arrow_drop_down</gui-icon>
          </button>
          <ng-template #rootM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>
                <gui-icon class="sym" guiMenuItemLeading>link</gui-icon>
                Copy link
              </button>
              <button gui-menu-item [cdkMenuTriggerFor]="subM">
                <gui-icon class="sym" guiMenuItemLeading>send</gui-icon>
                Send to
                <gui-icon class="sym" guiMenuItemTrailing>arrow_right</gui-icon>
              </button>
            </div>
          </ng-template>
          <ng-template #subM>
            <div gui-menu variant="vertical" cdkMenu>
              <button gui-menu-item>Email</button>
              <button gui-menu-item>Messages</button>
              <button gui-menu-item>Drive</button>
            </div>
          </ng-template>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class MenuDemo {}
