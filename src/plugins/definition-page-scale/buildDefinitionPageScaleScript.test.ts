import { describe, expect, it, jest } from '@jest/globals';

import { buildDefinitionPageScaleScript } from './buildDefinitionPageScaleScript';

type StyleElement = {
  id: string;
  remove: jest.Mock;
  textContent: string;
};

const ORIGINAL_VIEWPORT_CONTENT =
  'width=device-width, initial-scale=1';
const ORIGINAL_VIEWPORT_ATTRIBUTE =
  'data-oxford-viewer-original-content';

type ViewportElement = {
  getAttribute: jest.Mock<(name: string) => string | null>;
  hasAttribute: jest.Mock<(name: string) => boolean>;
  removeAttribute: jest.Mock<(name: string) => void>;
  setAttribute: jest.Mock<
    (name: string, value: string) => void
  >;
};

function createViewportElement(
  originalContent?: string,
): ViewportElement {
  const attributes = new Map<string, string>([
    ['content', ORIGINAL_VIEWPORT_CONTENT],
  ]);

  if (originalContent !== undefined) {
    attributes.set(
      ORIGINAL_VIEWPORT_ATTRIBUTE,
      originalContent,
    );
  }

  const viewportElement: ViewportElement = {
    getAttribute: jest.fn(
      (name: string) => attributes.get(name) ?? null,
    ),
    hasAttribute: jest.fn((name: string) =>
      attributes.has(name),
    ),
    removeAttribute: jest.fn((name: string) => {
      attributes.delete(name);
    }),
    setAttribute: jest.fn((name: string, value: string) => {
      attributes.set(name, value);
    }),
  };

  return viewportElement;
}

function runInjectedScript(
  paneWidth: number,
  shrinkToFit: boolean,
  existingStyle: StyleElement | null = null,
  viewportElement = createViewportElement(),
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
    querySelector: jest.fn(() => viewportElement),
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
    viewportElement,
    windowValue,
  };
}

describe('buildDefinitionPageScaleScript', () => {
  it('shrinks a narrow portrait definition pane from 320 CSS pixels', () => {
    const {
      createdStyle,
      documentValue,
      viewportElement,
      windowValue,
    } =
      runInjectedScript(200, true);

    expect(windowValue.__oxfordDefinitionPageScale).toBe(0.625);
    expect(createdStyle.id).toBe(
      'oxford-viewer-definition-page-scale',
    );
    expect(viewportElement.setAttribute).toHaveBeenCalledWith(
      ORIGINAL_VIEWPORT_ATTRIBUTE,
      ORIGINAL_VIEWPORT_CONTENT,
    );
    expect(viewportElement.setAttribute).toHaveBeenCalledWith(
      'content',
      'width=320, initial-scale=0.625',
    );
    expect(createdStyle.textContent).toContain(
      'width: 320px !important',
    );
    expect(createdStyle.textContent).not.toContain('zoom:');
    expect(createdStyle.textContent).not.toContain('160%');
    expect(createdStyle.textContent).toContain(
      'html { overflow-x: hidden !important; }',
    );
    expect(createdStyle.textContent).toContain(
      'min-width: 320px !important',
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
    const viewportElement = createViewportElement(
      ORIGINAL_VIEWPORT_CONTENT,
    );
    const { windowValue } = runInjectedScript(
      400,
      true,
      existingStyle,
      viewportElement,
    );

    expect(windowValue.__oxfordDefinitionPageScale).toBe(1);
    expect(viewportElement.setAttribute).toHaveBeenCalledWith(
      'content',
      ORIGINAL_VIEWPORT_CONTENT,
    );
    expect(viewportElement.removeAttribute).toHaveBeenCalledWith(
      ORIGINAL_VIEWPORT_ATTRIBUTE,
    );
    expect(existingStyle.remove).toHaveBeenCalledTimes(1);
  });

  it('removes portrait scaling in landscape', () => {
    const existingStyle: StyleElement = {
      id: 'oxford-viewer-definition-page-scale',
      remove: jest.fn(),
      textContent: 'old',
    };
    const viewportElement = createViewportElement(
      ORIGINAL_VIEWPORT_CONTENT,
    );
    const { windowValue } = runInjectedScript(
      200,
      false,
      existingStyle,
      viewportElement,
    );

    expect(windowValue.__oxfordDefinitionPageScale).toBe(1);
    expect(viewportElement.setAttribute).toHaveBeenCalledWith(
      'content',
      ORIGINAL_VIEWPORT_CONTENT,
    );
    expect(viewportElement.removeAttribute).toHaveBeenCalledWith(
      ORIGINAL_VIEWPORT_ATTRIBUTE,
    );
    expect(existingStyle.remove).toHaveBeenCalledTimes(1);
  });

  it('preserves the Oxford viewport across repeated orientation changes', () => {
    const existingStyle: StyleElement = {
      id: 'oxford-viewer-definition-page-scale',
      remove: jest.fn(),
      textContent: 'old',
    };
    const viewportElement = createViewportElement();

    runInjectedScript(
      200,
      true,
      existingStyle,
      viewportElement,
    );
    runInjectedScript(
      200,
      true,
      existingStyle,
      viewportElement,
    );

    expect(
      viewportElement.setAttribute.mock.calls.filter(
        ([name]) => name === ORIGINAL_VIEWPORT_ATTRIBUTE,
      ),
    ).toHaveLength(1);

    runInjectedScript(
      480,
      false,
      existingStyle,
      viewportElement,
    );

    expect(viewportElement.getAttribute('content')).toBe(
      ORIGINAL_VIEWPORT_CONTENT,
    );
    expect(
      viewportElement.hasAttribute(
        ORIGINAL_VIEWPORT_ATTRIBUTE,
      ),
    ).toBe(false);

    runInjectedScript(
      200,
      true,
      existingStyle,
      viewportElement,
    );

    expect(
      viewportElement.setAttribute.mock.calls.filter(
        ([name]) => name === ORIGINAL_VIEWPORT_ATTRIBUTE,
      ),
    ).toHaveLength(2);
    expect(
      viewportElement.getAttribute(
        ORIGINAL_VIEWPORT_ATTRIBUTE,
      ),
    ).toBe(ORIGINAL_VIEWPORT_CONTENT);
    expect(viewportElement.getAttribute('content')).toBe(
      'width=320, initial-scale=0.625',
    );
  });

  it('applies scaling before entry observers when the viewport meta appears', () => {
    const createdStyle: StyleElement = {
      id: '',
      remove: jest.fn(),
      textContent: '',
    };
    const root = {
      appendChild: jest.fn(),
    };
    const delayedViewportElement = createViewportElement();
    const documentValue: {
      addEventListener: jest.Mock;
      createElement: jest.Mock;
      documentElement: typeof root | null;
      getElementById: jest.Mock;
      head: typeof root | null;
      querySelector: jest.Mock;
    } = {
      addEventListener: jest.fn(),
      createElement: jest.fn(() => createdStyle),
      documentElement: root,
      getElementById: jest.fn(() => null),
      head: root,
      querySelector: jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValue(delayedViewportElement),
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

    observerCallback?.();

    expect(root.appendChild).toHaveBeenCalledWith(createdStyle);
    expect(
      delayedViewportElement.setAttribute,
    ).toHaveBeenCalledWith(
      'content',
      'width=320, initial-scale=0.625',
    );
    expect(windowValue.__oxfordDefinitionPageScale).toBe(0.625);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('ends with the WebView-compatible truthy expression', () => {
    expect(buildDefinitionPageScaleScript(200, true)).toMatch(
      /true;\s*$/,
    );
  });
});
