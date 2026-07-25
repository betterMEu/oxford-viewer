import { describe, expect, it } from '@jest/globals';

import { buildPaneWidthFitScript } from './buildPaneWidthFitScript';

describe('buildPaneWidthFitScript', () => {
  it('overrides the verified Oxford minimum widths when enabled', () => {
    const script = buildPaneWidthFitScript(true);

    expect(script).toContain('oxford-viewer-pane-width-fit');
    expect(script).toContain('body');
    expect(script).toContain('.responsive_container');
    expect(script).toContain('.responsive_row');
    expect(script).toContain('min-width: 0 !important');
    expect(script).toContain('overflow-x: hidden !important');
  });

  it('removes the fit style when disabled', () => {
    const script = buildPaneWidthFitScript(false);

    expect(script).toContain(
      "document.getElementById('oxford-viewer-pane-width-fit')",
    );
    expect(script).toContain('styleElement.remove()');
  });

  it('waits for DOM readiness when no style parent exists yet', () => {
    const addEventListener = jest.fn();
    const documentValue = {
      addEventListener,
      createElement: jest.fn(() => ({
        id: '',
        textContent: '',
      })),
      documentElement: null,
      getElementById: jest.fn(() => null),
      head: null,
    };
    const execute = new Function(
      'document',
      buildPaneWidthFitScript(true),
    );

    execute(documentValue);

    expect(addEventListener).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function),
      { once: true },
    );
  });

  it('ends with the WebView-compatible truthy expression', () => {
    expect(buildPaneWidthFitScript(true)).toMatch(/true;\s*$/);
    expect(buildPaneWidthFitScript(false)).toMatch(/true;\s*$/);
  });
});
