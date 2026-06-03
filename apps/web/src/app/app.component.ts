import { Component, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
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
  MenuDirective,
  MenuDividerComponent,
  MenuItemComponent,
} from '@ngguide/ui/menu';
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
import { SliderComponent } from '@ngguide/ui/slider';
import {
  TextFieldComponent,
  TextFieldInputDirective,
  TextFieldLeadingDirective,
  TextFieldTrailingDirective,
} from '@ngguide/ui/text-field';
import {
  DatePickerComponent,
  DateRangePickerComponent,
} from '@ngguide/ui/date-picker';
import { GuiDateRange, GuiTime } from '@ngguide/ui/datetime';
import { TimePickerComponent } from '@ngguide/ui/time-picker';
import { GuiBadge } from '@ngguide/ui/badge';
import {
  GuiCircularProgress,
  GuiLinearProgress,
} from '@ngguide/ui/progress';
import { GuiLoadingIndicator } from '@ngguide/ui/loading-indicator';
import { GuiSnackbar } from '@ngguide/ui/snackbar';
import {
  GuiRichTooltip,
  GuiRichTooltipTrigger,
  GuiTooltip,
} from '@ngguide/ui/tooltip';
import {
  GuiCard,
  GuiCardClickable,
  GuiCardPrimaryAction,
} from '@ngguide/ui/card';
import { GuiDivider } from '@ngguide/ui/divider';
import { GuiList, GuiListItem } from '@ngguide/ui/list';
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
    CdkMenuTrigger,
    MenuDirective,
    MenuItemComponent,
    MenuDividerComponent,
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
    SliderComponent,
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldLeadingDirective,
    TextFieldTrailingDirective,
    DatePickerComponent,
    DateRangePickerComponent,
    TimePickerComponent,
    GuiBadge,
    GuiLinearProgress,
    GuiCircularProgress,
    GuiLoadingIndicator,
    GuiTooltip,
    GuiRichTooltip,
    GuiRichTooltipTrigger,
    GuiCard,
    GuiCardClickable,
    GuiCardPrimaryAction,
    GuiDivider,
    GuiList,
    GuiListItem,
    ReactiveFormsModule,
    FormsModule,
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

  /** Containment demo: last card interaction, for visible feedback. */
  readonly lastCardAction = signal('none');
  readonly cardVariants = ['elevated', 'filled', 'outlined'] as const;
  readonly fruits = ['Apple', 'Banana', 'Cherry', 'Date'];

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

  /** Determinate progress demo value (0..1). */
  readonly progressValue = signal(0.4);

  private readonly snackbar = inject(GuiSnackbar);

  /** Demo: a simple auto-dismissing snackbar. */
  showSnackbar(): void {
    this.snackbar.open('Profile saved');
  }

  /** Demo: a snackbar with an action. */
  showSnackbarWithAction(): void {
    const ref = this.snackbar.open({ message: 'Message deleted', action: 'Undo' });
    ref.onAction.subscribe(() => this.snackbar.open('Restore complete'));
  }

  /** Demo: an action-required snackbar (no auto-dismiss) with a close button. */
  showSnackbarRequired(): void {
    this.snackbar.open({
      message: 'Connection lost — changes are saved locally and will sync',
      action: 'Retry',
      showClose: true,
      duration: null,
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

  /** Slider demo state. */
  volume = signal(40);
  rating = signal(30);
  priceRange = signal<[number, number]>([20, 80]);

  /** Reactive-form example bound to a gui-slider. */
  brightnessControl = new FormControl(60);

  /** Text field demo state. */
  firstName = signal('');
  email = signal('');
  amount = signal('');
  bio = signal('');

  /** Reactive-form example bound to a projected text-field input (D1). */
  usernameControl = new FormControl('');

  /** Date picker examples (docked / modal / modal-input). */
  dateControl = new FormControl<Date | null>(null);

  /** Date-range picker example (modal). */
  dateRangeControl = new FormControl<GuiDateRange>(
    { start: null, end: null },
    { nonNullable: true },
  );

  /** Time picker example. */
  timeControl = new FormControl<GuiTime | null>(null);

  clearEmail(): void {
    this.email.set('');
  }

  /** No-op handler for the split-button primary action demo. */
  onSave(): void {
    // no-op demo handler
  }
}
