import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { GuiDateRange } from '@ngguide/ui/datetime';
import { DateRangePickerComponent } from './date-range-picker';

@Component({
  template: `<gui-date-range-picker [formControl]="ctrl" />`,
  imports: [DateRangePickerComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<GuiDateRange>(
    { start: null, end: null },
    { nonNullable: true },
  );
}

describe('DateRangePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Tear down any open overlay between tests (overlay lives in document.body).
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((el) => el.remove());
  });

  const trigger = () =>
    fixture.nativeElement.querySelector(
      'button[gui-icon-button]',
    ) as HTMLButtonElement;

  // Find an in-month day cell in the open dialog (overlay is in document body).
  const cellByDay = (day: string) =>
    Array.from(
      document.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]'),
    ).find(
      (c) => c.textContent?.trim() === day && c.getAttribute('data-outside') === null,
    );

  const ok = () =>
    Array.from(
      document.querySelectorAll<HTMLButtonElement>('button[gui-button]'),
    ).find((b) => b.textContent?.trim() === 'OK');

  it('selecting start then a later end commits an ordered range on OK', () => {
    trigger().click();
    fixture.detectChanges();

    cellByDay('10')?.click();
    fixture.detectChanges();
    cellByDay('20')?.click();
    fixture.detectChanges();

    ok()?.click();
    fixture.detectChanges();

    const range = host.ctrl.value;
    expect(range.start?.getDate()).toBe(10);
    expect(range.end?.getDate()).toBe(20);
    expect(range.start?.getTime() ?? 0).toBeLessThanOrEqual(
      range.end?.getTime() ?? 0,
    );
  });

  it('selecting end BEFORE start swaps them so the committed range is ordered', () => {
    trigger().click();
    fixture.detectChanges();

    cellByDay('20')?.click();
    fixture.detectChanges();
    cellByDay('10')?.click();
    fixture.detectChanges();

    ok()?.click();
    fixture.detectChanges();

    const range = host.ctrl.value;
    expect(range.start?.getDate()).toBe(10);
    expect(range.end?.getDate()).toBe(20);
    expect(range.start?.getTime() ?? 0).toBeLessThanOrEqual(
      range.end?.getTime() ?? 0,
    );
  });

  it('marks in-range cells with data-in-range while staging', () => {
    trigger().click();
    fixture.detectChanges();

    cellByDay('10')?.click();
    fixture.detectChanges();
    cellByDay('20')?.click();
    fixture.detectChanges();

    // A day strictly between 10 and 20 should be flagged in-range.
    const mid = cellByDay('15');
    expect(mid?.getAttribute('data-in-range')).toBe('');
    // Endpoints carry the endpoint attributes, not the in-range fill.
    expect(cellByDay('10')?.getAttribute('data-range-start')).toBe('');
    expect(cellByDay('20')?.getAttribute('data-range-end')).toBe('');
  });
});
