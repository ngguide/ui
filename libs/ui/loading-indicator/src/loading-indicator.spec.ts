import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiLoadingIndicator } from './loading-indicator';

@Component({
  imports: [GuiLoadingIndicator],
  template: `<gui-loading-indicator [variant]="variant" [label]="label" />`,
})
class HostComponent {
  variant: 'default' | 'contained' = 'default';
  label: string | undefined;
}

describe('GuiLoadingIndicator', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  function el(): HTMLElement {
    return fixture.nativeElement.querySelector('gui-loading-indicator');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('renders an SVG path and is an indeterminate progressbar', () => {
    fixture.detectChanges();

    expect(el().getAttribute('role')).toBe('progressbar');
    expect(el().getAttribute('aria-busy')).toBe('true');
    expect(el().getAttribute('aria-valuenow')).toBeNull();
    const path = el().querySelector('.gui-loading-shape');
    expect(path).not.toBeNull();
    expect(path?.getAttribute('d')).toMatch(/^M/);
  });

  it('defaults the accessible label to "Loading"', () => {
    fixture.detectChanges();
    expect(el().getAttribute('aria-label')).toBe('Loading');
  });

  it('uses a provided label', () => {
    host.label = 'Fetching results';
    fixture.detectChanges();
    expect(el().getAttribute('aria-label')).toBe('Fetching results');
  });

  it('reflects the variant on the host', () => {
    fixture.detectChanges();
    expect(el().getAttribute('data-variant')).toBe('default');

    const contained = TestBed.createComponent(HostComponent);
    contained.componentInstance.variant = 'contained';
    contained.detectChanges();
    expect(
      (
        contained.nativeElement.querySelector(
          'gui-loading-indicator',
        ) as HTMLElement
      ).getAttribute('data-variant'),
    ).toBe('contained');
  });

  it('produces a deterministic shape path (stable across instances)', () => {
    fixture.detectChanges();
    const d1 = el()
      .querySelector('.gui-loading-shape')
      ?.getAttribute('d');

    const other = TestBed.createComponent(HostComponent);
    other.detectChanges();
    const d2 = (
      other.nativeElement.querySelector('.gui-loading-shape') as SVGPathElement
    ).getAttribute('d');

    expect(d1).toBe(d2);
    expect(d1).toBeTruthy();
  });
});
