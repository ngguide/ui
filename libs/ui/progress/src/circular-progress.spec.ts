import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiCircularProgress } from './circular-progress';

@Component({
  imports: [GuiCircularProgress],
  template: `<gui-circular-progress [value]="value" [label]="label" />`,
})
class HostComponent {
  value: number | null = null;
  label = 'Loading';
}

describe('GuiCircularProgress', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  function el(): HTMLElement {
    return fixture.nativeElement.querySelector('gui-circular-progress');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('renders an SVG with a track and active arc', () => {
    fixture.detectChanges();
    expect(el().querySelector('svg')).not.toBeNull();
    expect(el().querySelector('.gui-circular-track')).not.toBeNull();
    expect(el().querySelector('.gui-circular-active')).not.toBeNull();
  });

  it('is indeterminate (no aria-valuenow) when value is null', () => {
    host.value = null;
    fixture.detectChanges();

    expect(el().getAttribute('data-mode')).toBe('indeterminate');
    expect(el().getAttribute('aria-valuenow')).toBeNull();
  });

  it('is determinate and exposes aria-valuenow when value is set', () => {
    host.value = 0.75;
    fixture.detectChanges();

    expect(el().getAttribute('data-mode')).toBe('determinate');
    expect(el().getAttribute('aria-valuenow')).toBe('75');
  });

  it('fully offsets the active arc at value 0 (no visible progress)', () => {
    host.value = 0;
    fixture.detectChanges();
    const active = el().querySelector('.gui-circular-active') as SVGCircleElement;
    const circumference = 2 * Math.PI * 22;
    expect(Number(active.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      circumference,
      3,
    );
  });

  it('zeroes the active arc offset at value 1 (complete)', () => {
    host.value = 1;
    fixture.detectChanges();
    const active = el().querySelector('.gui-circular-active') as SVGCircleElement;
    expect(Number(active.getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 3);
  });

  it('uses round stroke caps on the active arc', () => {
    fixture.detectChanges();
    const active = el().querySelector('.gui-circular-active') as SVGCircleElement;
    expect(active.getAttribute('stroke-linecap')).toBe('round');
  });
});
