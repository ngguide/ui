import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { GuiSize } from '@ngguide/ui';
import { M3ThemeService } from '@ngguide/ui/theme';

import { ButtonComponent, GuiButtonVariant } from '@ngguide/ui/button';
import { ButtonGroupComponent } from '@ngguide/ui/button-group';
import {
  ExtendedFabComponent,
  FabComponent,
  GuiFabColor,
  GuiFabSize,
} from '@ngguide/ui/fab';
import { FabMenuComponent, FabMenuItemComponent } from '@ngguide/ui/fab-menu';
import { IconComponent } from '@ngguide/ui/icon';
import {
  GuiIconButtonVariant,
  IconButtonComponent,
} from '@ngguide/ui/icon-button';
import {
  SegmentedButtonComponent,
  SegmentedButtonGroupComponent,
} from '@ngguide/ui/segmented-button';
import { SplitButtonComponent } from '@ngguide/ui/split-button';
import { CheckboxComponent } from '@ngguide/ui/checkbox';
import { ChipComponent, ChipSetComponent } from '@ngguide/ui/chip';
import { RadioComponent, RadioGroupComponent } from '@ngguide/ui/radio';
import { SwitchComponent } from '@ngguide/ui/switch';
import { InteractionDemoComponent } from './interaction-demo.component';

@Component({
  imports: [
    RouterModule,
    ButtonComponent,
    ButtonGroupComponent,
    FabComponent,
    ExtendedFabComponent,
    FabMenuComponent,
    FabMenuItemComponent,
    CdkMenu,
    CdkMenuItem,
    SplitButtonComponent,
    IconComponent,
    IconButtonComponent,
    SegmentedButtonGroupComponent,
    SegmentedButtonComponent,
    CheckboxComponent,
    ChipSetComponent,
    ChipComponent,
    RadioGroupComponent,
    RadioComponent,
    SwitchComponent,
    ReactiveFormsModule,
    InteractionDemoComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly theme = inject(M3ThemeService);

  /** Demo brand seeds to exercise runtime re-theming (Req 7.3). */
  readonly brandSeeds = ['#6750A4', '#00629D', '#B3261E'];

  /** Re-theme the running app from a brand seed color. */
  applyBrand(seed: string): void {
    this.theme.setTheme({
      sourceColor: seed,
      variant: 'tonal-spot',
      contrast: 'standard',
      mode: 'auto',
      customColors: [{ name: 'brand-success', value: '#2e7d32' }],
    });
  }

  sizes: GuiSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  variants: GuiButtonVariant[] = [
    'filled',
    'elevated',
    'tonal',
    'outlined',
    'text',
  ];

  /** Selected state for the toggle button demo. */
  bold = false;
  italic = false;
  underline = false;
  fabColors: GuiFabColor[] = [
    'primary-container',
    'secondary-container',
    'tertiary-container',
  ];
  fabSizes: GuiFabSize[] = ['sm', 'md', 'lg'];

  iconButtonVariants: GuiIconButtonVariant[] = [
    'standard',
    'filled',
    'tonal',
    'outlined',
  ];

  /** Selected state for the toggle icon button demo. */
  favorite = false;

  /** Single-select segmented buttons demo. */
  alignment: string | null = 'center';

  /** Multi-select segmented buttons demo. */
  weekdays: string[] = ['mon'];

  /** Checkbox demo state. */
  terms = false;
  newsletter = true;
  selectAll = false;

  /** Switch demo state. */
  wifi = false;
  bluetooth = true;
  darkMode = false;

  /** Radio demo state. */
  contact: string | null = 'email';

  /** Filter chip set (multiple) demo state. */
  filters = signal<string[]>(['new']);

  /** Input chip set demo state — removable chips splice this array. */
  recipients = signal<string[]>(['alice', 'bob', 'carol']);

  removeRecipient(name: string): void {
    this.recipients.update((list) => list.filter((x) => x !== name));
  }

  /** Reactive-form example bound to a gui-checkbox and a gui-switch. */
  acceptControl = new FormControl(false);
  notifyControl = new FormControl(true);

  /** Reactive-form example bound to a gui-radio-group. */
  planControl = new FormControl<string | null>('pro');

  /** No-op handler for the split-button primary action demo. */
  onSave(): void {
    // no-op demo handler
  }
}
