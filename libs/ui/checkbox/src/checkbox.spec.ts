import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox';

@Component({
  template: `<gui-checkbox
    [(checked)]="checked"
    [indeterminate]="indeterminate()"
    [disabled]="disabled()"
    >Label</gui-checkbox
  >`,
  imports: [CheckboxComponent],
})
class HostComponent {
  checked = signal<boolean | null>(false);
  indeterminate = signal(false);
  disabled = signal(false);
}

@Component({
  template: `<gui-checkbox [formControl]="control">Label</gui-checkbox>`,
  imports: [CheckboxComponent, ReactiveFormsModule],
})
class ReactiveHostComponent {
  control = new FormControl<boolean>(false);
}

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let input: HTMLInputElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector(
      'input[type=checkbox]',
    ) as HTMLInputElement;
  });

  it('should create', () => {
    expect(input).toBeTruthy();
  });

  it('toggles the host checked model and reflects aria-checked on click', () => {
    expect(host.checked()).toBe(false);
    expect(input.getAttribute('aria-checked')).toBe('false');

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(false);
    expect(input.getAttribute('aria-checked')).toBe('false');
  });

  it('reflects aria-checked="mixed" when indeterminate', () => {
    host.indeterminate.set(true);
    fixture.detectChanges();

    expect(input.indeterminate).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('mixed');
  });

  it('blocks toggling when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(input.disabled).toBe(true);

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(false);
  });

  describe('reactive forms', () => {
    let reactiveFixture: ComponentFixture<ReactiveHostComponent>;
    let reactiveHost: ReactiveHostComponent;
    let reactiveInput: HTMLInputElement;

    beforeEach(() => {
      reactiveFixture = TestBed.createComponent(ReactiveHostComponent);
      reactiveHost = reactiveFixture.componentInstance;
      reactiveFixture.detectChanges();
      reactiveInput = reactiveFixture.nativeElement.querySelector(
        'input[type=checkbox]',
      ) as HTMLInputElement;
    });

    it('writeValue sets the checked state from the control', () => {
      reactiveHost.control.setValue(true);
      reactiveFixture.detectChanges();

      expect(reactiveInput.checked).toBe(true);
      expect(reactiveInput.getAttribute('aria-checked')).toBe('true');
    });

    it('disabling the control disables the input', () => {
      reactiveHost.control.disable();
      reactiveFixture.detectChanges();

      expect(reactiveInput.disabled).toBe(true);
    });
  });
});
