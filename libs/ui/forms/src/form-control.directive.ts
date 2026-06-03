import {
  Directive,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[guiFormControl]',
  exportAs: 'guiFormControl',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GuiFormControl),
      multi: true,
    },
  ],
})
export class GuiFormControl<T = unknown> implements ControlValueAccessor {
  readonly value = model<T | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly formDisabled = signal(false);
  readonly effectiveDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  readonly touched = signal(false);

  private onChange: (v: T | null) => void = () => {
    /* no-op until registered */
  };
  private onTouched: () => void = () => {
    /* no-op until registered */
  };

  writeValue(v: T | null): void {
    this.value.set(v);
  }

  registerOnChange(fn: (v: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  emit(v: T | null): void {
    this.value.set(v);
    this.onChange(v);
  }

  markTouched(): void {
    if (!this.touched()) {
      this.touched.set(true);
      this.onTouched();
    }
  }
}
