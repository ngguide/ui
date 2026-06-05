import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent } from './slider';

@Component({
  template: `<gui-slider
    [min]="min()"
    [max]="max()"
    [step]="step()"
    [stops]="stops()"
    [range]="range()"
    [disabled]="disabled()"
    [(value)]="value"
  ></gui-slider>`,
  imports: [SliderComponent],
})
class HostComponent {
  min = signal(0);
  max = signal(100);
  step = signal(1);
  stops = signal(false);
  range = signal(false);
  disabled = signal(false);
  value = signal<number | [number, number] | null>(0);
}

function key(el: Element, k: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('SliderComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function thumbs(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[role="slider"]'),
    ) as HTMLElement[];
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a single thumb with role="slider"', () => {
    expect(thumbs().length).toBe(1);
    expect(thumbs()[0].getAttribute('aria-valuenow')).toBe('0');
  });

  it('ArrowRight increases by step and clamps at max', () => {
    host.value.set(99);
    fixture.detectChanges();

    key(thumbs()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(host.value()).toBe(100);

    key(thumbs()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(host.value()).toBe(100);
  });

  it('ArrowLeft decreases by step and clamps at min', () => {
    host.value.set(1);
    fixture.detectChanges();

    key(thumbs()[0], 'ArrowLeft');
    fixture.detectChanges();
    expect(host.value()).toBe(0);

    key(thumbs()[0], 'ArrowLeft');
    fixture.detectChanges();
    expect(host.value()).toBe(0);
  });

  it('Home sets min and End sets max', () => {
    host.value.set(50);
    fixture.detectChanges();

    key(thumbs()[0], 'Home');
    fixture.detectChanges();
    expect(host.value()).toBe(0);

    key(thumbs()[0], 'End');
    fixture.detectChanges();
    expect(host.value()).toBe(100);
  });

  it('snaps to step with stop indicators on', () => {
    host.stops.set(true);
    host.step.set(10);
    host.value.set(0);
    fixture.detectChanges();

    key(thumbs()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(host.value()).toBe(10);
  });

  it('keeps start ≤ end when driving the start thumb past the end (range)', () => {
    host.range.set(true);
    host.value.set([20, 50]);
    fixture.detectChanges();

    const [startThumb] = thumbs();
    // Push the start thumb up past the end via Space + ArrowUp (interval = 10×step).
    key(startThumb, ' ');
    fixture.detectChanges();
    key(startThumb, 'ArrowUp');
    fixture.detectChanges();
    key(startThumb, 'ArrowUp');
    fixture.detectChanges();
    key(startThumb, 'ArrowUp');
    fixture.detectChanges();
    key(startThumb, 'ArrowUp');
    fixture.detectChanges();

    const value = host.value() as [number, number];
    expect(value[0]).toBeLessThanOrEqual(value[1]);
    expect(value[0]).toBe(50);
  });

  it('Space + Arrow steps by one interval (10×step)', () => {
    host.value.set(0);
    fixture.detectChanges();

    key(thumbs()[0], ' ');
    fixture.detectChanges();
    key(thumbs()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(host.value()).toBe(10);
  });

  it('sets aria-orientation on the handle', () => {
    expect(thumbs()[0].getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('renders two thumbs in range mode', () => {
    host.range.set(true);
    host.value.set([20, 80]);
    fixture.detectChanges();
    expect(thumbs().length).toBe(2);
  });

  it('ignores keyboard when disabled', () => {
    host.value.set(50);
    host.disabled.set(true);
    fixture.detectChanges();

    key(thumbs()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(host.value()).toBe(50);
    expect(thumbs()[0].getAttribute('tabindex')).toBe('-1');
  });
});
