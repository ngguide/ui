import { GUI_BUTTON_SHAPES } from './action-tokens';
import { GuiSize } from './size';

describe('GUI_BUTTON_SHAPES', () => {
  const sizes: GuiSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  it('has exactly the five M3 sizes', () => {
    expect(Object.keys(GUI_BUTTON_SHAPES)).toHaveLength(5);
    for (const size of sizes) {
      expect(GUI_BUTTON_SHAPES[size]).toBeDefined();
    }
  });

  it('maps every round shape to the Full corner token', () => {
    for (const size of sizes) {
      expect(GUI_BUTTON_SHAPES[size].round).toBe(
        'var(--md-sys-shape-corner-full)',
      );
    }
  });

  it('maps square shapes per the M3 corner table', () => {
    expect(GUI_BUTTON_SHAPES.xs.square).toBe('var(--md-sys-shape-corner-medium)');
    expect(GUI_BUTTON_SHAPES.sm.square).toBe('var(--md-sys-shape-corner-medium)');
    expect(GUI_BUTTON_SHAPES.md.square).toBe('var(--md-sys-shape-corner-large)');
    expect(GUI_BUTTON_SHAPES.lg.square).toBe(
      'var(--md-sys-shape-corner-extra-large)',
    );
    expect(GUI_BUTTON_SHAPES.xl.square).toBe(
      'var(--md-sys-shape-corner-extra-large)',
    );
  });

  it('maps pressed shapes per the M3 corner table', () => {
    expect(GUI_BUTTON_SHAPES.xs.pressed).toBe('var(--md-sys-shape-corner-small)');
    expect(GUI_BUTTON_SHAPES.sm.pressed).toBe('var(--md-sys-shape-corner-small)');
    expect(GUI_BUTTON_SHAPES.md.pressed).toBe(
      'var(--md-sys-shape-corner-medium)',
    );
    expect(GUI_BUTTON_SHAPES.lg.pressed).toBe('var(--md-sys-shape-corner-large)');
    expect(GUI_BUTTON_SHAPES.xl.pressed).toBe('var(--md-sys-shape-corner-large)');
  });
});
