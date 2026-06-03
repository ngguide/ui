import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { GuiTime } from '@ngguide/ui/datetime';
import { TimePickerComponent } from './time-picker';

@Component({
  template: `<gui-time-picker
    [variant]="variant()"
    [hour12]="hour12()"
    [formControl]="ctrl"
  />`,
  imports: [TimePickerComponent, ReactiveFormsModule],
})
class HostComponent {
  ctrl = new FormControl<GuiTime | null>(null);
  variant = signal<'dial' | 'input'>('input');
  hour12 = signal<boolean | null>(null);
  picker = viewChild.required(TimePickerComponent);
}

describe('TimePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((el) => el.remove());
  });

  const trigger = () =>
    fixture.nativeElement.querySelector(
      'button[gui-icon-button]',
    ) as HTMLButtonElement;

  const openPanel = () => {
    trigger().click();
    fixture.detectChanges();
  };

  const queryDoc = (sel: string) =>
    document.querySelector(sel) as HTMLElement | null;
  const queryAllDoc = (sel: string) =>
    Array.from(document.querySelectorAll(sel)) as HTMLElement[];

  const hourSpinbutton = () =>
    queryAllDoc('[role="spinbutton"]').find(
      (el) => el.getAttribute('aria-label') === 'Hour',
    );

  const periodControl = () => queryDoc('.gui-time-period');

  it('24h: hour spinbutton max is 23 and no AM/PM control is present', () => {
    host.hour12.set(false);
    fixture.detectChanges();
    openPanel();

    expect(hourSpinbutton()?.getAttribute('aria-valuemax')).toBe('23');
    expect(hourSpinbutton()?.getAttribute('aria-valuemin')).toBe('0');
    expect(periodControl()).toBeNull();
  });

  it('12h: hour spinbutton max is 12 and an AM/PM control exists', () => {
    host.hour12.set(true);
    fixture.detectChanges();
    openPanel();

    expect(hourSpinbutton()?.getAttribute('aria-valuemax')).toBe('12');
    expect(hourSpinbutton()?.getAttribute('aria-valuemin')).toBe('1');
    expect(periodControl()).not.toBeNull();
  });

  it('committing via OK sets the control value to a GuiTime', () => {
    host.hour12.set(false);
    fixture.detectChanges();
    openPanel();

    // Step the hour spinbutton up from 0 -> 1.
    hourSpinbutton()?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    fixture.detectChanges();

    const ok = queryAllDoc('button[gui-button]').find(
      (b) => b.textContent?.trim() === 'OK',
    );
    ok?.click();
    fixture.detectChanges();

    expect(host.ctrl.value).toEqual({ hours: 1, minutes: 0 });
  });

  it('Cancel does not change the control value', () => {
    host.hour12.set(false);
    host.ctrl.setValue({ hours: 5, minutes: 30 });
    fixture.detectChanges();
    openPanel();

    hourSpinbutton()?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    fixture.detectChanges();

    const cancel = queryAllDoc('button[gui-button]').find(
      (b) => b.textContent?.trim() === 'Cancel',
    );
    cancel?.click();
    fixture.detectChanges();

    expect(host.ctrl.value).toEqual({ hours: 5, minutes: 30 });
  });
});
