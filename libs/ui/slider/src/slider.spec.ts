import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuiSize } from '@ngguide/ui';
import { SliderComponent } from './slider';

@Component({
  template: `<gui-slider
    [min]="min()"
    [max]="max()"
    [step]="step()"
    [stops]="stops()"
    [range]="range()"
    [centered]="centered()"
    [size]="size()"
    [orientation]="orientation()"
    [valueIndicator]="valueIndicator()"
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
  centered = signal(false);
  size = signal<GuiSize>('xs');
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
  valueIndicator = signal(false);
  disabled = signal(false);
  value = signal<number | [number, number] | null>(0);
}

@Component({
  template: `<gui-slider range aria-label="Price" [value]="[20, 80]" />`,
  imports: [SliderComponent],
})
class RangeLabelHost {}

@Component({
  template: `<gui-slider
    valueIndicator
    [displayWith]="fmt"
    [value]="40"
    aria-label="Volume"
  />`,
  imports: [SliderComponent],
})
class FormatHost {
  readonly fmt = (v: number) => `${v}%`;
}

@Component({
  template: `<gui-slider [size]="size()">
    <span gui-slider-icon>icon</span>
  </gui-slider>`,
  imports: [SliderComponent],
})
class IconHost {
  size = signal<GuiSize>('xs');
}

function key(el: Element, k: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('SliderComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let sliderEl: HTMLElement;

  function thumbs(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[role="slider"]'),
    ) as HTMLElement[];
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    sliderEl = fixture.nativeElement.querySelector('gui-slider') as HTMLElement;
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
    for (let i = 0; i < 4; i++) {
      key(startThumb, 'ArrowUp');
      fixture.detectChanges();
    }

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

  it('emits aria-orientation only for the vertical layout', () => {
    expect(thumbs()[0].getAttribute('aria-orientation')).toBeNull();

    host.orientation.set('vertical');
    fixture.detectChanges();
    expect(thumbs()[0].getAttribute('aria-orientation')).toBe('vertical');
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

  it('renders the track as separate active and inactive segments (gapped pills)', () => {
    host.value.set(50);
    fixture.detectChanges();

    const segs = sliderEl.querySelectorAll('.gui-slider-seg');
    expect(segs.length).toBeGreaterThanOrEqual(2);
    expect(sliderEl.querySelectorAll('.gui-slider-seg-active').length).toBe(1);
    // The active segment carves a gap on its trailing (handle-facing) edge.
    const active = sliderEl.querySelector(
      '.gui-slider-seg-active',
    ) as HTMLElement;
    expect(active.style.getPropertyValue('--gui-slider-seg-gap-end')).toContain(
      'gui-slider-gap',
    );
  });

  it('mounts the interaction layer on the handle-state capsule, not the host', () => {
    const state = sliderEl.querySelector('.gui-slider-thumb-state');
    expect(state).not.toBeNull();
    expect(state?.classList.contains('gui-state-layer')).toBe(true);
    expect(state?.classList.contains('gui-focus-ring')).toBe(true);
    expect(state?.classList.contains('gui-ripple-host')).toBe(true);
    expect(state?.getAttribute('role')).toBe('slider');
    // The host must NOT carry the interaction layer.
    expect(sliderEl.classList.contains('gui-state-layer')).toBe(false);
    expect(sliderEl.classList.contains('gui-focus-ring')).toBe(false);
  });

  it('colors stop ticks by track side (active → on-primary, inactive → on-secondary-container)', () => {
    host.stops.set(true);
    host.step.set(10);
    host.value.set(50);
    fixture.detectChanges();

    const ticks = sliderEl.querySelectorAll('.gui-slider-tick');
    expect(ticks.length).toBe(11); // 0..100 step 10
    // Ticks at 0..50 sit over the active fill.
    expect(sliderEl.querySelectorAll('.gui-slider-tick-active').length).toBe(6);
  });

  it('drops aria-valuetext when no formatter is provided', () => {
    expect(thumbs()[0].getAttribute('aria-valuetext')).toBeNull();
  });

  it('ignores centered when range is set (centered is single-thumb only)', () => {
    host.range.set(true);
    host.centered.set(true);
    host.value.set([20, 80]);
    fixture.detectChanges();

    expect(sliderEl.hasAttribute('data-centered')).toBe(false);
    expect(sliderEl.hasAttribute('data-range')).toBe(true);
    expect(thumbs().length).toBe(2);
  });

  describe('range handle labels', () => {
    it('auto-suffixes start / end on the two handles', () => {
      const f = TestBed.createComponent(RangeLabelHost);
      f.detectChanges();
      const t = Array.from(
        f.nativeElement.querySelectorAll('[role="slider"]'),
      ) as HTMLElement[];
      expect(t[0].getAttribute('aria-label')).toBe('Price start');
      expect(t[1].getAttribute('aria-label')).toBe('Price end');
    });
  });

  describe('value formatter', () => {
    it('formats the value indicator and aria-valuetext via displayWith', () => {
      const f = TestBed.createComponent(FormatHost);
      f.detectChanges();
      const thumb = f.nativeElement.querySelector(
        '[role="slider"]',
      ) as HTMLElement;
      const label = f.nativeElement.querySelector(
        '.gui-slider-value',
      ) as HTMLElement;
      expect(thumb.getAttribute('aria-valuetext')).toBe('40%');
      expect(label.textContent?.trim()).toBe('40%');
    });
  });

  describe('inset icon gating', () => {
    it('hides the inset icon at xs and shows it at md (standard, M/L/XL only)', () => {
      const f = TestBed.createComponent(IconHost);
      f.detectChanges();
      expect(
        f.nativeElement.querySelector('.gui-slider-inset-icon'),
      ).toBeNull();

      f.componentInstance.size.set('md');
      f.detectChanges();
      expect(
        f.nativeElement.querySelector('.gui-slider-inset-icon'),
      ).not.toBeNull();
    });
  });
});
