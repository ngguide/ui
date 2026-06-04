import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiLinearProgress } from './linear-progress';

@Component({
  imports: [GuiLinearProgress],
  template: `<gui-linear-progress [value]="value" [label]="label" />`,
})
class HostComponent {
  value: number | null = null;
  label = 'Loading';
}

describe('GuiLinearProgress', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  function el(): HTMLElement {
    return fixture.nativeElement.querySelector('gui-linear-progress');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('exposes role="progressbar"', () => {
    fixture.detectChanges();
    expect(el().getAttribute('role')).toBe('progressbar');
  });

  it('is indeterminate (no aria-valuenow) when value is null', () => {
    host.value = null;
    fixture.detectChanges();

    expect(el().getAttribute('data-mode')).toBe('indeterminate');
    expect(el().getAttribute('aria-valuenow')).toBeNull();
  });

  it('is determinate and exposes aria-valuenow when value is set', () => {
    host.value = 0.42;
    fixture.detectChanges();

    expect(el().getAttribute('data-mode')).toBe('determinate');
    expect(el().getAttribute('aria-valuenow')).toBe('42');
    expect(el().getAttribute('aria-valuemin')).toBe('0');
    expect(el().getAttribute('aria-valuemax')).toBe('100');
  });

  it('clamps values outside 0..1', () => {
    host.value = 1.5;
    fixture.detectChanges();
    expect(el().getAttribute('aria-valuenow')).toBe('100');

    const fixture2 = TestBed.createComponent(HostComponent);
    fixture2.componentInstance.value = -0.5;
    fixture2.detectChanges();
    expect(
      (
        fixture2.nativeElement.querySelector('gui-linear-progress') as HTMLElement
      ).getAttribute('aria-valuenow'),
    ).toBe('0');
  });

  it('distinguishes value 0 (determinate) from null (indeterminate)', () => {
    host.value = 0;
    fixture.detectChanges();
    expect(el().getAttribute('data-mode')).toBe('determinate');
    expect(el().getAttribute('aria-valuenow')).toBe('0');
  });

  it('scales the active bar by the clamped value', () => {
    host.value = 0.5;
    fixture.detectChanges();
    const active = el().querySelector('.gui-linear-active') as HTMLElement;
    expect(active.style.transform).toBe('scaleX(0.5)');
  });

  it('renders the track as the gapped inactive segment (1 - value)', () => {
    host.value = 0.3;
    fixture.detectChanges();
    const track = el().querySelector('.gui-linear-track') as HTMLElement;
    expect(track.style.transform).toBe('scaleX(0.7)');
  });

  it('always exposes an accessible name, defaulting when no label is given', () => {
    host.label = undefined as unknown as string;
    fixture.detectChanges();
    expect(el().getAttribute('aria-label')).toBe('Loading');
  });
});
