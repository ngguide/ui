import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiCard } from '@ngguide/ui/card';
import { GuiDivider } from '@ngguide/ui/divider';
import { SwitchComponent } from '@ngguide/ui/switch';
import { RadioGroupComponent, RadioComponent } from '@ngguide/ui/radio';
import { SliderComponent } from '@ngguide/ui/slider';
import {
  SegmentedButtonGroupComponent,
  SegmentedButtonComponent,
} from '@ngguide/ui/segmented-button';
import { GuiTooltip } from '@ngguide/ui/tooltip';
import { GuiRichTooltip, GuiRichTooltipTrigger } from '@ngguide/ui/tooltip';

/**
 * Console preferences (`/admin/settings`). Pure local demo state — these toggles
 * never touch the shell's ThemeController; they only exercise the kit's form and
 * tooltip components.
 */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    GuiCard,
    GuiDivider,
    SwitchComponent,
    RadioGroupComponent,
    RadioComponent,
    SliderComponent,
    SegmentedButtonGroupComponent,
    SegmentedButtonComponent,
    GuiTooltip,
    GuiRichTooltip,
    GuiRichTooltipTrigger,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  protected readonly emailDigest = signal(true);
  protected readonly compactDensity = signal(false);
  protected readonly landingView = signal<string | null>('dashboard');
  protected readonly itemsPerPage = signal(25);
  protected readonly contrast = signal<string | null>('standard');
}
