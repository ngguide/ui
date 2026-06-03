import { TestBed } from '@angular/core/testing';
import { GuiSnackbarSurface } from './snackbar';
import {
  GUI_SNACKBAR_CONTROLLER,
  GUI_SNACKBAR_DATA,
  GuiSnackbarController,
  GuiSnackbarData,
} from './snackbar-config';

function setup(
  data: GuiSnackbarData,
  controller: GuiSnackbarController,
): ReturnType<typeof TestBed.createComponent<GuiSnackbarSurface>> {
  TestBed.configureTestingModule({
    providers: [
      { provide: GUI_SNACKBAR_DATA, useValue: data },
      { provide: GUI_SNACKBAR_CONTROLLER, useValue: controller },
    ],
  });
  const fixture = TestBed.createComponent(GuiSnackbarSurface);
  fixture.detectChanges();
  return fixture;
}

describe('GuiSnackbarSurface', () => {
  let controller: GuiSnackbarController;

  beforeEach(() => {
    controller = { activateAction: vi.fn(), dismiss: vi.fn() };
  });

  it('renders the message and exposes role="status"', () => {
    const fixture = setup(
      { message: 'Saved', showClose: false, twoLine: false },
      controller,
    );
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('status');
    expect(
      host.querySelector('.gui-snackbar-label')?.textContent?.trim(),
    ).toBe('Saved');
  });

  it('renders no action or close affordance by default', () => {
    const fixture = setup(
      { message: 'Saved', showClose: false, twoLine: false },
      controller,
    );
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.gui-snackbar-action')).toBeNull();
    expect(host.querySelector('.gui-snackbar-close')).toBeNull();
  });

  it('renders an action button and reports activation', () => {
    const fixture = setup(
      { message: 'Deleted', action: 'Undo', showClose: false, twoLine: false },
      controller,
    );
    const action = (fixture.nativeElement as HTMLElement).querySelector(
      '.gui-snackbar-action',
    ) as HTMLButtonElement;
    expect(action.textContent?.trim()).toBe('Undo');

    action.click();
    expect(controller.activateAction).toHaveBeenCalledTimes(1);
  });

  it('renders a close button and dismisses on click', () => {
    const fixture = setup(
      { message: 'Saved', showClose: true, twoLine: false },
      controller,
    );
    const close = (fixture.nativeElement as HTMLElement).querySelector(
      '.gui-snackbar-close',
    ) as HTMLButtonElement;
    expect(close).not.toBeNull();

    close.click();
    expect(controller.dismiss).toHaveBeenCalledWith('dismiss');
  });

  it('marks the host data-two-line when two-line', () => {
    const fixture = setup(
      { message: 'A longer message', showClose: false, twoLine: true },
      controller,
    );
    expect(
      (fixture.nativeElement as HTMLElement).getAttribute('data-two-line'),
    ).toBe('true');
  });
});
