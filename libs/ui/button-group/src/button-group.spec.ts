import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonGroupComponent } from './button-group';

describe('ButtonGroupComponent', () => {
  let fixture: ComponentFixture<ButtonGroupComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonGroupComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes role="group" on the host', () => {
    expect(host.getAttribute('role')).toBe('group');
  });

  it('reflects the connected input onto the data-connected attribute', () => {
    // Default / false → no attribute (standard arrangement).
    expect(host.hasAttribute('data-connected')).toBe(false);

    fixture.componentRef.setInput('connected', true);
    fixture.detectChanges();
    expect(host.hasAttribute('data-connected')).toBe(true);

    fixture.componentRef.setInput('connected', false);
    fixture.detectChanges();
    expect(host.hasAttribute('data-connected')).toBe(false);
  });

  it('is not focusable itself (no tabindex on the container)', () => {
    expect(host.hasAttribute('tabindex')).toBe(false);
  });

  it('defaults size to md and shape to round on the host', () => {
    expect(host.getAttribute('data-size')).toBe('md');
    expect(host.getAttribute('data-shape')).toBe('round');
  });

  it('reflects size and shape inputs onto data attributes', () => {
    fixture.componentRef.setInput('size', 'xs');
    fixture.componentRef.setInput('shape', 'square');
    fixture.detectChanges();
    expect(host.getAttribute('data-size')).toBe('xs');
    expect(host.getAttribute('data-shape')).toBe('square');
  });

  it('advertises selection mode via role / aria-multiselectable', () => {
    // none → plain group, not multiselectable.
    expect(host.getAttribute('role')).toBe('group');
    expect(host.hasAttribute('aria-multiselectable')).toBe(false);

    fixture.componentRef.setInput('selection', 'single');
    fixture.detectChanges();
    expect(host.getAttribute('role')).toBe('radiogroup');
    expect(host.hasAttribute('aria-multiselectable')).toBe(false);

    fixture.componentRef.setInput('selection', 'multi');
    fixture.detectChanges();
    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-multiselectable')).toBe('true');
  });
});
