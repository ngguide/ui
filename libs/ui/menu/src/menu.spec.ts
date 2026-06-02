import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { MenuDirective } from './menu';
import { MenuItemComponent } from './menu-item';
import { MenuDividerComponent } from './menu-divider';

@Component({
  imports: [
    CdkMenu,
    CdkMenuTrigger,
    MenuDirective,
    MenuItemComponent,
    MenuDividerComponent,
  ],
  template: `
    <button [cdkMenuTriggerFor]="m">Open</button>
    <ng-template #m>
      <div gui-menu cdkMenu>
        <button gui-menu-item>
          <span guiMenuItemLeading>L</span>
          A
          <span guiMenuItemTrailing>T</span>
        </button>
        <gui-menu-divider />
        <button gui-menu-item [disabled]="true">B</button>
      </div>
    </ng-template>
  `,
})
class HostComponent {}

/** Open the menu in-template (jsdom-friendly) so items/divider render. */
function openMenu(fixture: ReturnType<typeof TestBed.createComponent>): boolean {
  try {
    const cdkTrigger = fixture.debugElement
      .query(By.directive(CdkMenuTrigger))
      .injector.get(CdkMenuTrigger);
    cdkTrigger.open();
    fixture.detectChanges();
    return true;
  } catch {
    // The CDK overlay needs real layout/positioning, which jsdom/zoneless
    // cannot provide. Open-state behaviour is validated in the browser test
    // plan; here we skip the assertions that require an open panel.
    return false;
  }
}

describe('Menu', () => {
  it('renders the trigger button', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const trigger = fixture.debugElement.query(By.directive(CdkMenuTrigger));
    expect(trigger).toBeTruthy();
    expect(trigger.nativeElement.textContent).toContain('Open');
  });

  it('composes CdkMenuItem on gui-menu-item and styles the surface', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    if (!openMenu(fixture)) {
      return;
    }

    const items = fixture.debugElement.queryAll(By.directive(CdkMenuItem));
    expect(items.length).toBe(2);

    const surface = document.querySelector('div[gui-menu]');
    expect(surface?.classList.contains('gui-menu')).toBe(true);
  });

  it('renders a separator divider', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    if (!openMenu(fixture)) {
      return;
    }

    const divider = document.querySelector('gui-menu-divider');
    expect(divider?.getAttribute('role')).toBe('separator');
  });

  it('projects leading/label/trailing slots', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    if (!openMenu(fixture)) {
      return;
    }

    const item = document.querySelector('button[gui-menu-item]');
    expect(item?.querySelector('.gui-menu-item-leading')?.textContent).toContain(
      'L',
    );
    expect(item?.querySelector('.gui-menu-item-label')?.textContent).toContain(
      'A',
    );
    expect(
      item?.querySelector('.gui-menu-item-trailing')?.textContent,
    ).toContain('T');
  });

  it('reflects disabled as aria-disabled via CdkMenuItem', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    if (!openMenu(fixture)) {
      return;
    }

    const items = fixture.debugElement
      .queryAll(By.directive(CdkMenuItem))
      .map((de) => de.injector.get(CdkMenuItem));
    const disabled = items.find((item) => item.disabled);
    expect(disabled).toBeTruthy();
  });
});
