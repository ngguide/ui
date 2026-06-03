import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent } from './date-picker';

@Component({
  template: `<gui-date-picker
    [variant]="variant"
    [formControl]="ctrl"
  />`,
  imports: [DatePickerComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<Date | null>(null);
  variant: 'docked' | 'modal' | 'modal-input' = 'docked';
  picker = viewChild.required(DatePickerComponent);
}

describe('DatePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Tear down any open overlay between tests.
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((el) => el.remove());
  });

  const trigger = () =>
    fixture.nativeElement.querySelector(
      'button[gui-icon-button]',
    ) as HTMLButtonElement;

  it('shows the formatted control value in the input', () => {
    host.ctrl.setValue(new Date(2026, 2, 9));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input[guiTextFieldInput]',
    ) as HTMLInputElement;
    // en-US default -> "3/9/2026"
    expect(input.value).toContain('2026');
    expect(input.value).toContain('3');
  });

  it('programmatic setValue updates the display without re-emitting from the picker', () => {
    let emissions = 0;
    host.ctrl.valueChanges.subscribe(() => emissions++);

    host.ctrl.setValue(new Date(2026, 2, 9));
    fixture.detectChanges();

    // A programmatic write flows through writeValue, not the CVA onChange — so
    // setValue fires valueChanges exactly once and the picker does not loop it
    // back as a second (user) emission. (Relaxed from "0 emissions": setValue
    // itself always emits on valueChanges by Angular's contract.)
    expect(emissions).toBe(1);
    const input = fixture.nativeElement.querySelector(
      'input[guiTextFieldInput]',
    ) as HTMLInputElement;
    expect(input.value).not.toBe('');
  });

  it('opening (docked) and selecting a date updates the control', () => {
    trigger().click();
    fixture.detectChanges();

    const cell = Array.from(
      document.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]'),
    ).find(
      (c) =>
        c.textContent?.trim() === '10' &&
        c.getAttribute('data-outside') === null,
    );
    expect(cell).toBeTruthy();
    cell?.click();
    fixture.detectChanges();

    expect(host.ctrl.value).not.toBeNull();
    expect(host.ctrl.value?.getDate()).toBe(10);
  });

  it('sets the error state on an unparseable typed value', () => {
    const input = fixture.nativeElement.querySelector(
      'input[guiTextFieldInput]',
    ) as HTMLInputElement;
    input.value = 'not-a-date';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector(
      'gui-text-field',
    ) as HTMLElement;
    expect(field.getAttribute('data-error')).toBe('');
    expect(host.ctrl.value).toBeNull();
  });

  it('a valid typed value commits to the control', () => {
    const input = fixture.nativeElement.querySelector(
      'input[guiTextFieldInput]',
    ) as HTMLInputElement;
    input.value = '2026-03-21';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(host.ctrl.value?.getMonth()).toBe(2);
    expect(host.ctrl.value?.getDate()).toBe(21);
  });
});
