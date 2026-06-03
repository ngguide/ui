import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GuiCard } from '@ngguide/ui/card';
import { GuiDivider } from '@ngguide/ui/divider';
import { GuiList, GuiListItem } from '@ngguide/ui/list';
import { GuiCircularProgress, GuiLinearProgress } from '@ngguide/ui/progress';
import { ButtonComponent } from '@ngguide/ui/button';
import { ButtonGroupComponent } from '@ngguide/ui/button-group';
import { IconComponent } from '@ngguide/ui/icon';

import { Metric } from '../core/models';
import {
  formatCurrency,
  formatDelta,
  formatNumber,
  formatPercent,
  formatRelative,
} from '../core/formatters';
import { DEMO_TODAY } from '../core/demo-date';
import { AdminStore } from './admin.store';
import { SparklineComponent } from './sparkline.component';

type Range = '7d' | '30d' | '90d';

/**
 * Console landing screen: KPI cards (headline number + delta + sparkline +
 * goal-attainment progress) and a recent-activity list. Visualizations are KPI
 * + `gui-progress` + inline SVG — no third-party chart product (Decision 4C).
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GuiCard,
    GuiDivider,
    GuiList,
    GuiListItem,
    GuiCircularProgress,
    GuiLinearProgress,
    ButtonComponent,
    ButtonGroupComponent,
    IconComponent,
    SparklineComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected readonly store = inject(AdminStore);

  protected readonly ranges: readonly Range[] = ['7d', '30d', '90d'];
  protected readonly range = signal<Range>('30d');

  protected formatDelta = formatDelta;

  protected formatValue(m: Metric): string {
    switch (m.format) {
      case 'currency':
        return formatCurrency(m.value);
      case 'percent':
        return formatPercent(m.value);
      default:
        return formatNumber(m.value);
    }
  }

  /** Where the latest sample sits within its recent range → 0..1 goal bar. */
  protected ratio(m: Metric): number {
    const min = Math.min(...m.spark);
    const max = Math.max(...m.spark);
    const range = max - min || 1;
    const last = m.spark[m.spark.length - 1];
    return Math.min(1, Math.max(0, (last - min) / range));
  }

  protected ratioPct(m: Metric): string {
    return formatPercent(this.ratio(m) * 100);
  }

  protected relative(d: Date): string {
    return formatRelative(d, DEMO_TODAY);
  }
}
