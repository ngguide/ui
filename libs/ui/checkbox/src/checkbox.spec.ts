import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox';

@Component({
  template: `<gui-checkbox
    [(checked)]="checked"
    [indeterminate]="indeterminate()"
    [disabled]="disabled()"
    [error]="error()"
    >Label</gui-checkbox
  >`,
  imports: [CheckboxComponent],
})
class HostComponent {
  checked = signal<boolean | null>(false);
  indeterminate = signal(false);
  disabled = signal(false);
  error = signal(false);
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

  it('scopes the state layer / focus ring to a 40dp control circle', () => {
    // The interaction directives live on a dedicated element around the box,
    // not on the host (so the tint/ring never wrap the adjacent label).
    const checkbox = fixture.nativeElement.querySelector(
      'gui-checkbox',
    ) as HTMLElement;
    const state = checkbox.querySelector('.gui-checkbox-state');
    expect(state).not.toBeNull();
    expect(state?.classList.contains('gui-state-layer')).toBe(true);
    expect(state?.classList.contains('gui-focus-ring')).toBe(true);
    expect(state?.classList.contains('gui-ripple-host')).toBe(true);
    // The host itself must NOT carry the interaction layer.
    expect(checkbox.classList.contains('gui-state-layer')).toBe(false);
    expect(checkbox.classList.contains('gui-focus-ring')).toBe(false);
  });

  it('links the input to its adjacent label via for/id and aria-labelledby', () => {
    const textLabel = fixture.nativeElement.querySelector(
      'label.gui-checkbox-label',
    ) as HTMLLabelElement;

    expect(input.id).toBeTruthy();
    expect(textLabel.htmlFor).toBe(input.id);
    // aria-labelledby points at that text label, so AT reads the UI text.
    expect(textLabel.id).toBeTruthy();
    expect(input.getAttribute('aria-labelledby')).toBe(textLabel.id);
    expect(textLabel.textContent?.trim()).toBe('Label');
  });

  it('toggles the checkbox when its adjacent text label is clicked', () => {
    const textLabel = fixture.nativeElement.querySelector(
      'label.gui-checkbox-label',
    ) as HTMLLabelElement;

    textLabel.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(true);
    expect(input.checked).toBe(true);
  });

  it('sets aria-invalid only in the error state', () => {
    expect(input.getAttribute('aria-invalid')).toBeNull();

    host.error.set(true);
    fixture.detectChanges();

    expect(input.getAttribute('aria-invalid')).toBe('true');
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
