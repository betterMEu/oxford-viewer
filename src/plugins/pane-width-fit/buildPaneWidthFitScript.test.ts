import { describe, expect, it } from '@jest/globals';

import { buildPaneWidthFitScript } from './buildPaneWidthFitScript';

describe('buildPaneWidthFitScript', () => {
  const executeEnabledScript = (clientWidth: number) => {
    const styleElement = {
      id: '',
      textContent: '',
    };
    const documentValue = {
      addEventListener: jest.fn(),
      createElement: jest.fn(() => styleElement),
      documentElement: {
        appendChild: jest.fn(),
        clientWidth,
      },
      getElementById: jest.fn(() => null),
      head: null,
    };
    const execute = new Function(
      'document',
      buildPaneWidthFitScript(true),
    );

    execute(documentValue);

    return styleElement.textContent;
  };

  it('scales the native 320px layout below 100% to fit a narrow pane', () => {
    const styleText = executeEnabledScript(200);

    expect(styleText).toContain('min-width: 320px !important');
    expect(styleText).toContain('zoom: 0.625 !important');
    expect(styleText).toContain('width: 160% !important');
    expect(styleText).not.toContain('min-width: 0 !important');
  });

  it('does not enlarge content above 100% in a wide pane', () => {
    const styleText = executeEnabledScript(400);

    expect(styleText).toContain('zoom: 1 !important');
    expect(styleText).toContain('width: 100% !important');
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
