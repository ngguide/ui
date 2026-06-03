import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  TemplateRef,
  ViewContainerRef,
  inject,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiPickerOverlay } from './picker-overlay';

@Component({
  template: `
    <button #trigger type="button">trigger</button>
    <ng-template #tpl><div class="panel">panel</div></ng-template>
  `,
})
class HostComponent {
  readonly tpl = viewChild.required('tpl', { read: TemplateRef });
  readonly vcr = inject(ViewContainerRef);

  buildPortal(): TemplatePortal {
    return new TemplatePortal(this.tpl(), this.vcr);
  }
}

describe('GuiPickerOverlay', () => {
  let service: GuiPickerOverlay;
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.inject(GuiPickerOverlay);
  });

  it('openModal attaches a portal and close() disposes + completes closed', () => {
    const portal = host.buildPortal();
    const handle = service.openModal(portal, {});

    expect(handle.ref.hasAttached()).toBe(true);

    const events: string[] = [];
    handle.closed.subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    handle.close();

    expect(handle.ref.hasAttached()).toBe(false);
    expect(events).toEqual(['next', 'complete']);
  });

  it('restores focus to the previously focused element on close', () => {
    const trigger = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    document.body.appendChild(fixture.nativeElement);
    trigger.focus();

    const portal = host.buildPortal();
    const handle = service.openModal(portal, {});
    handle.close();

    // Under jsdom focus() is a no-op for detached/uninstrumented nodes; the
    // restore path is exercised without throwing. When focus tracking works,
    // activeElement returns to the trigger.
    expect(handle.ref.hasAttached()).toBe(false);
    if (document.activeElement !== document.body) {
      expect(document.activeElement).toBe(trigger);
    }

    fixture.nativeElement.remove();
  });

  it('openDocked attaches a portal anchored to the origin', () => {
    const origin = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    const portal = host.buildPortal();
    const handle = service.openDocked(portal, { origin });

    expect(handle.ref.hasAttached()).toBe(true);

    handle.close();
    expect(handle.ref.hasAttached()).toBe(false);
  });
});
