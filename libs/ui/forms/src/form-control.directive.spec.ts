import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GuiFormControl } from './form-control.directive';

@Component({
  template: `<div guiFormControl [disabled]="disabled()"></div>`,
  imports: [GuiFormControl],
})
class HostComponent {
  disabled = signal(false);
}

describe('GuiFormControl', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let directive: GuiFormControl<number>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    directive = fixture.debugElement
      .query(By.directive(GuiFormControl))
      .injector.get<GuiFormControl<number>>(GuiFormControl);
  });

  it('writeValue sets value() without calling onChange', () => {
    const onChange = vi.fn();
    directive.registerOnChange(onChange);

    directive.writeValue(5);

    expect(directive.value()).toBe(5);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('emit sets value() and calls onChange', () => {
    const onChange = vi.fn();
    directive.registerOnChange(onChange);

    directive.emit(7);

    expect(directive.value()).toBe(7);
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('setDisabledState merges into effectiveDisabled()', () => {
    expect(directive.effectiveDisabled()).toBe(false);

    directive.setDisabledState(true);

    expect(directive.effectiveDisabled()).toBe(true);
  });

  it('disabled input merges into effectiveDisabled()', () => {
    expect(directive.effectiveDisabled()).toBe(false);

    host.disabled.set(true);
    fixture.detectChanges();

    expect(directive.effectiveDisabled()).toBe(true);
  });

  it('markTouched flips touched() and calls onTouched once even if called twice', () => {
    const onTouched = vi.fn();
    directive.registerOnTouched(onTouched);

    directive.markTouched();
    directive.markTouched();

    expect(directive.touched()).toBe(true);
    expect(onTouched).toHaveBeenCalledTimes(1);
  });
});
