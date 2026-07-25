import { describe, expect, it, jest } from '@jest/globals';

import { buildDefinitionPageScaleScript } from './buildDefinitionPageScaleScript';

type StyleElement = {
  id: string;
  remove: jest.Mock;
  textContent: string;
};

function runInjectedScript(
  paneWidth: number,
  shrinkToFit: boolean,
  existingStyle: StyleElement | null = null,
) {
  const createdStyle: StyleElement = {
    id: '',
    remove: jest.fn(),
    textContent: '',
  };
  const documentValue = {
    addEventListener: jest.fn(),
    createElement: jest.fn(() => createdStyle),
    documentElement: {
      appendChild: jest.fn(),
    },
    getElementById: jest.fn(() => existingStyle),
    head: {
      appendChild: jest.fn(),
    },
  };
  const windowValue: {
    __oxfordDefinitionPageScale?: number;
  } = {};
  const execute = new Function(
    'document',
    'window',
    'MutationObserver',
    buildDefinitionPageScaleScript(paneWidth, shrinkToFit),
  );

  execute(documentValue, windowValue, jest.fn());

  return {
    createdStyle,
    documentValue,
    windowValue,
  };
}

describe('buildDefinitionPageScaleScript', () => {
  it('shrinks a narrow portrait definition pane from 320 CSS pixels', () => {
    const { createdStyle, documentValue, windowValue } =
      runInjectedScript(200, true);

    expect(windowValue.__oxfordDefinitionPageScale).toBe(0.625);
    expect(createdStyle.id).toBe(
      'oxford-viewer-definition-page-scale',
    );
    expect(createdStyle.textContent).toContain(
      'zoom: 0.625 !important',
    );
    expect(createdStyle.textContent).toContain(
      'width: 160% !important',
    );
    expect(
      documentValue.head.appendChild,
    ).toHaveBeenCalledWith(createdStyle);
  });

  it('caps portrait scale at one for a pane at least 320 pixels wide', () => {
    const existingStyle: StyleElement = {
      id: 'oxford-viewer-definition-page-scale',
      remove: jest.fn(),
      textContent: 'old',
    };
    const { windowValue } = runInjectedScript(
      400,
      true,
      existingStyle,
    );

    expect(windowValue.__oxfordDefinitionPageScale).toBe(1);
    expect(existingStyle.remove).toHaveBeenCalledTimes(1);
  });

  it('removes portrait scaling in landscape', () => {
    const existingStyle: StyleElement = {
      id: 'oxford-viewer-definition-page-scale',
      remove: jest.fn(),
      textContent: 'old',
    };
    const { windowValue } = runInjectedScript(
      200,
      false,
      existingStyle,
    );

    expect(windowValue.__oxfordDefinitionPageScale).toBe(1);
    expect(existingStyle.remove).toHaveBeenCalledTimes(1);
  });

  it('applies scaling before entry observers when the document root appears', () => {
    const createdStyle: StyleElement = {
      id: '',
      remove: jest.fn(),
      textContent: '',
    };
    const root = {
      appendChild: jest.fn(),
    };
    const documentValue: {
      addEventListener: jest.Mock;
      createElement: jest.Mock;
      documentElement: typeof root | null;
      getElementById: jest.Mock;
      head: typeof root | null;
    } = {
      addEventListener: jest.fn(),
      createElement: jest.fn(() => createdStyle),
      documentElement: null,
      getElementById: jest.fn(() => null),
      head: null,
    };
    const windowValue: {
      __oxfordDefinitionPageScale?: number;
    } = {};
    const observer = {
      disconnect: jest.fn(),
      observe: jest.fn(),
    };
    let observerCallback: (() => void) | undefined;
    const mutationObserverValue = jest.fn(
      (callback: () => void) => {
        observerCallback = callback;
        return observer;
      },
    );
    const execute = new Function(
      'document',
      'window',
      'MutationObserver',
      buildDefinitionPageScaleScript(200, true),
    );

    execute(
      documentValue,
      windowValue,
      mutationObserverValue,
    );

    expect(windowValue.__oxfordDefinitionPageScale).toBe(1);
    expect(observer.observe).toHaveBeenCalledWith(documentValue, {
      childList: true,
      subtree: true,
    });

    documentValue.documentElement = root;
    observerCallback?.();

    expect(root.appendChild).toHaveBeenCalledWith(createdStyle);
    expect(windowValue.__oxfordDefinitionPageScale).toBe(0.625);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('ends with the WebView-compatible truthy expression', () => {
    expect(buildDefinitionPageScaleScript(200, true)).toMatch(
      /true;\s*$/,
    );
  });
});
