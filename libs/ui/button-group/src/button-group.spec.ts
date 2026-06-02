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
});
