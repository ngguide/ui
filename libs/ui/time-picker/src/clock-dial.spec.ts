import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuiTime } from '@ngguide/ui/datetime';
import { ClockDialComponent } from './clock-dial';

@Component({
  template: `<gui-clock-dial
    [mode]="mode()"
    [hour12]="hour12()"
    [(value)]="value"
  />`,
  imports: [ClockDialComponent],
})
class HostComponent {
  mode = signal<'hours' | 'minutes'>('hours');
  hour12 = signal(true);
  value = signal<GuiTime | undefined>({ hours: 0, minutes: 0 });
  dial = viewChild.required(ClockDialComponent);
}

describe('ClockDialComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const dialEl = () =>
    fixture.nativeElement.querySelector('gui-clock-dial') as HTMLElement;
  const numbers = () =>
    dialEl().querySelectorAll('.gui-clock-number');

  // Top-center of the dial corresponds to 12-o'clock => angle 0 => hour 12.
  // Pointer geometry is unreliable under jsdom (getBoundingClientRect returns
  // zeros), so we drive the engine through the protected `selectFromAngle`
  // method — equivalent to a pointerdown at the top-center. (Relaxation noted.)
  it('selecting the top-center in hours mode selects hour 12', () => {
    (host.dial() as unknown as { selectFromAngle(deg: number): void })
      .selectFromAngle(0);
    fixture.detectChanges();
    expect(host.value()?.hours).toBe(12);
  });

  it('24h mode renders inner-ring numbers (> 12); 12h renders exactly 12', () => {
    expect(numbers().length).toBe(12);

    host.hour12.set(false);
    fixture.detectChanges();
    expect(numbers().length).toBeGreaterThan(12);
  });

  it('ArrowUp in minutes mode increments the minute', () => {
    host.mode.set('minutes');
    host.value.set({ hours: 0, minutes: 10 });
    fixture.detectChanges();

    dialEl().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    fixture.detectChanges();
    expect(host.value()?.minutes).toBe(11);
  });
});
