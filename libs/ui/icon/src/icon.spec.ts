import { TestBed } from '@angular/core/testing';
import { IconComponent } from './icon';

describe('IconComponent', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(IconComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not set --gui-comp-icon-size when size is unset', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.style.getPropertyValue('--gui-comp-icon-size'),
    ).toBe('');
  });

  it('should set --gui-comp-icon-size to "<n>px" when size is set', () => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('size', 40);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.style.getPropertyValue('--gui-comp-icon-size'),
    ).toBe('40px');
  });
});
