import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { ShellComponent } from './shell.component';
import { ThemeController } from './theme-controller';

describe('ShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
  });

  it('renders the routed content outlet', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });

  it('resolves the active app from the current URL (defaults to Console)', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.shell-app-title')?.textContent).toContain('Console');
    // Console exposes three rail destinations.
    expect(el.querySelectorAll('a[appNavItem]').length).toBe(3);
  });

  it('delegates the dark toggle to the ThemeController', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const theme = TestBed.inject(ThemeController);
    const spy = vi.spyOn(theme, 'setMode');
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { setMode(d: boolean): void }).setMode(
      true,
    );
    expect(spy).toHaveBeenCalledWith('dark');
  });
});
