import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@ngguide/ui/icon';
import { SwitchComponent } from '@ngguide/ui/switch';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 switch (`@ngguide/ui/switch`).
 *
 * Per the strict-M3 reference (m3.material.io/components/switch) the switch is a
 * SINGLE track size and shape: a fixed 52×32dp track with a `corner.full` shape
 * and a 48dp accessible target — there is no size, shape, or color-configuration
 * enumeration to sweep. What the spec DOES vary is:
 *
 * - Selection state — on / off (handle morphs 16dp → 24dp and slides; track
 *   switches from `surface-container-highest`/`outline` to `primary`).
 * - Icon configurations — without icons, icon on the selected handle, and icons
 *   on both selected and unselected handles.
 * - Interaction states — enabled / hovered / focused / pressed are driven live
 *   by the composed interaction foundation (state layer, ripple, focus ring),
 *   so they appear on real pointer/keyboard interaction.
 * - Disabled — the M3 disabled treatment for both off and on.
 *
 * The implemented `SwitchComponent` exposes exactly two knobs through its
 * composed `GuiFormControl`: `checked` (two-way `[(checked)]` / `(checkedChange)`,
 * or `[formControl]` / `[(ngModel)]`) and `disabled`. The default `<ng-content>`
 * is the adjacent text label; the `[guiSwitchIcon]` slot renders on the
 * unselected handle and `[guiSwitchSelectedIcon]` on the selected handle.
 *
 * All state is local signals / form controls — no clock, no RNG (SSR-safe).
 */
@Component({
  selector: 'app-demo-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    SwitchComponent,
    IconComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <app-demo-component
      name="Switch"
      entry="@ngguide/ui/switch"
      docHref="https://m3.material.io/components/switch"
    >
      <!-- The two M3 selection states — the switch's core variants. -->
      <app-demo-block
        heading="States"
        hint="The two M3 selection states — off (unselected) and on (selected)"
      >
        <app-demo-specimen label="off">
          <gui-switch [(checked)]="off">Wi-Fi</gui-switch>
        </app-demo-specimen>
        <app-demo-specimen label="on">
          <gui-switch [(checked)]="on">Wi-Fi</gui-switch>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Three M3 icon configurations on the handle. -->
      <app-demo-block
        heading="Icon configurations"
        hint="M3: without icons · icon on selected · icons on selected and unselected"
      >
        <app-demo-specimen label="without icons">
          <gui-switch [(checked)]="iconNone">Bluetooth</gui-switch>
        </app-demo-specimen>
        <app-demo-specimen label="icon on selected">
          <gui-switch [(checked)]="iconSelected">
            Bluetooth
            <gui-icon class="sym" guiSwitchSelectedIcon>check</gui-icon>
          </gui-switch>
        </app-demo-specimen>
        <app-demo-specimen label="icons on both">
          <gui-switch [(checked)]="iconBoth">
            Bluetooth
            <gui-icon class="sym" guiSwitchIcon>close</gui-icon>
            <gui-icon class="sym" guiSwitchSelectedIcon>check</gui-icon>
          </gui-switch>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Adjacent text label is optional; the switch works with or without it. -->
      <app-demo-block
        heading="Label"
        hint="The adjacent text label is optional (uses the on-surface color role)"
      >
        <app-demo-specimen label="with label">
          <gui-switch [(checked)]="labelled">Airplane mode</gui-switch>
        </app-demo-specimen>
        <app-demo-specimen label="no label">
          <gui-switch [(checked)]="bare" aria-label="Airplane mode" />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Interaction states — hover / focus / press are live (state layer,
           focus ring, handle press-grow). Toggle to feel the morph. -->
      <app-demo-block
        heading="Interaction"
        hint="Hover, focus (Tab) and press are live — the handle grows and a 40dp state layer appears"
      >
        <app-demo-specimen label="off (interact)">
          <gui-switch [(checked)]="interactOff">Notifications</gui-switch>
        </app-demo-specimen>
        <app-demo-specimen label="on (interact)">
          <gui-switch [(checked)]="interactOn">Notifications</gui-switch>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Disabled treatment for both selection states. -->
      <app-demo-block
        heading="Disabled"
        hint="The M3 disabled treatment for off and on"
      >
        <app-demo-specimen label="off · disabled">
          <gui-switch disabled>Sync</gui-switch>
        </app-demo-specimen>
        <app-demo-specimen label="on · disabled">
          <gui-switch disabled checked>Sync</gui-switch>
        </app-demo-specimen>
        <app-demo-specimen label="on · disabled · icon">
          <gui-switch disabled checked>
            Sync
            <gui-icon class="sym" guiSwitchSelectedIcon>check</gui-icon>
          </gui-switch>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Reactive forms binding — fully operable, live value readout. -->
      <app-demo-block
        heading="Reactive form"
        hint="Bound to a FormControl via ControlValueAccessor"
        [column]="true"
      >
        <app-demo-specimen label="FormControl (toggle me)" class="fill">
          <gui-switch [formControl]="darkMode">Dark mode</gui-switch>
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ darkMode.value }}</code>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ngModel binding — a list of independently controlled settings (M3 use case). -->
      <app-demo-block
        heading="Settings list (ngModel)"
        hint="Switches are the best way to let people adjust independent settings (M3)"
        [column]="true"
      >
        @for (setting of settings; track setting.label) {
          <app-demo-specimen [label]="setting.label" class="fill">
            <gui-switch [(ngModel)]="setting.value">{{ setting.label }}</gui-switch>
          </app-demo-specimen>
        }
      </app-demo-block>
    </app-demo-component>
  `,
})
export class SwitchDemo {
  // State-block specimens.
  protected readonly off = signal(false);
  protected readonly on = signal(true);

  // Icon-configuration specimens.
  protected readonly iconNone = signal(true);
  protected readonly iconSelected = signal(true);
  protected readonly iconBoth = signal(true);

  // Label-block specimens.
  protected readonly labelled = signal(true);
  protected readonly bare = signal(false);

  // Interaction-block specimens.
  protected readonly interactOff = signal(false);
  protected readonly interactOn = signal(true);

  // Reactive form specimen.
  protected readonly darkMode = new FormControl(true);

  // ngModel settings list. Plain mutable objects so [(ngModel)] writes back.
  protected readonly settings = [
    { label: 'Email digest', value: true },
    { label: 'Compact density', value: false },
    { label: 'Auto-update', value: true },
  ];
}
