import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar';

@Component({
  template: `<gui-calendar
    [(activeMonth)]="month"
    [selected]="selected()"
    [min]="min()"
    [max]="max()"
    [locale]="locale()"
    [today]="today"
    (dateSelected)="onSelect($event)"
  />`,
  imports: [CalendarComponent],
})
class HostComponent {
  // March 2026 (month0 = 2). 2026-03-01 is a Sunday.
  month = signal<Date>(new Date(2026, 2, 1));
  selected = signal<Date | null>(null);
  min = signal<Date | null>(null);
  max = signal<Date | null>(null);
  locale = signal('en-US');
  today = new Date(2026, 2, 15);
  picked: Date | null = null;
  onSelect(d: Date): void {
    this.picked = d;
  }
}

describe('CalendarComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let grid: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    grid = fixture.nativeElement.querySelector('gui-calendar') as HTMLElement;
  });

  const dayCells = () =>
    Array.from(
      grid.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]'),
    );

  it('has role=grid', () => {
    expect(grid.getAttribute('role')).toBe('grid');
  });

  it('renders 7 columnheaders', () => {
    const headers = grid.querySelectorAll('[role="columnheader"]');
    expect(headers.length).toBe(7);
  });

  it('orders weekdays Sunday-first for en-US and Monday-first for en-GB', () => {
    const usFirst = grid.querySelector('[role="columnheader"]')
      ?.getAttribute('abbr');
    expect(usFirst).toBe('Sunday');

    host.locale.set('en-GB');
    fixture.detectChanges();
    const gbFirst = grid.querySelector('[role="columnheader"]')
      ?.getAttribute('abbr');
    expect(gbFirst).toBe('Monday');
  });

  it('renders 42 gridcells', () => {
    expect(dayCells().length).toBe(42);
  });

  it('moves focus and aria with ArrowRight', () => {
    // Focus starts on today (2026-03-15).
    const before = dayCells().find((c) => c.getAttribute('tabindex') === '0');
    expect(before?.textContent?.trim()).toBe('15');

    grid.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    fixture.detectChanges();

    const after = dayCells().find((c) => c.getAttribute('tabindex') === '0');
    expect(after?.textContent?.trim()).toBe('16');
  });

  it('marks a min-bounded earlier cell aria-disabled and blocks selection', () => {
    host.min.set(new Date(2026, 2, 10));
    fixture.detectChanges();

    const earlier = dayCells().find(
      (c) =>
        c.textContent?.trim() === '5' &&
        c.getAttribute('data-outside') === null,
    );
    expect(earlier?.getAttribute('aria-disabled')).toBe('true');

    earlier?.click();
    fixture.detectChanges();
    expect(host.picked).toBeNull();
  });

  it('emits the date when an enabled cell is clicked', () => {
    const cell = dayCells().find(
      (c) =>
        c.textContent?.trim() === '20' &&
        c.getAttribute('data-outside') === null,
    );
    cell?.click();
    fixture.detectChanges();

    expect(host.picked).not.toBeNull();
    expect(host.picked?.getDate()).toBe(20);
    expect(host.picked?.getMonth()).toBe(2);
  });

  it('gives the selected date aria-selected', () => {
    host.selected.set(new Date(2026, 2, 12));
    fixture.detectChanges();

    const selected = dayCells().find(
      (c) => c.getAttribute('aria-selected') === 'true',
    );
    expect(selected?.textContent?.trim()).toBe('12');
  });
});
