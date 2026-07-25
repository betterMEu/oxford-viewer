import { describe, expect, it } from '@jest/globals';

import { buildDefinitionAutoScrollScript } from './buildDefinitionAutoScrollScript';

type ScrollTarget = {
  scrollIntoView: jest.Mock;
};

function runInjectedScript(
  documentValue: {
    querySelector: jest.Mock;
  },
  windowValue: {
    addEventListener: jest.Mock;
    __oxfordDefinitionAutoScrollInstalled?: boolean;
  },
  mutationObserverValue: jest.Mock,
) {
  const execute = new Function(
    'document',
    'window',
    'MutationObserver',
    buildDefinitionAutoScrollScript(),
  );

  execute(documentValue, windowValue, mutationObserverValue);
}

describe('buildDefinitionAutoScrollScript', () => {
  it('targets the verified Oxford dictionary entry container', () => {
    const script = buildDefinitionAutoScrollScript();

    expect(script).toContain(
      "document.querySelector('#entryContent')",
    );
  });

  it('scrolls immediately when the entry is already available', () => {
    const target: ScrollTarget = {
      scrollIntoView: jest.fn(),
    };
    const documentValue = {
      querySelector: jest.fn(() => target),
    };
    const windowValue = {
      addEventListener: jest.fn(),
    };
    const mutationObserverValue = jest.fn();

    runInjectedScript(
      documentValue,
      windowValue,
      mutationObserverValue,
    );

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(target.scrollIntoView).toHaveBeenLastCalledWith({
      block: 'start',
      behavior: 'auto',
    });
    expect(mutationObserverValue).not.toHaveBeenCalled();
  });

  it('scrolls as soon as the entry is inserted into the DOM', () => {
    const target: ScrollTarget = {
      scrollIntoView: jest.fn(),
    };
    const documentValue = {
      querySelector: jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValue(target),
    };
    const windowValue = {
      addEventListener: jest.fn(),
    };
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

    runInjectedScript(
      documentValue,
      windowValue,
      mutationObserverValue,
    );

    expect(target.scrollIntoView).not.toHaveBeenCalled();
    expect(observer.observe).toHaveBeenCalledWith(documentValue, {
      childList: true,
      subtree: true,
    });

    observerCallback?.();

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not use fixed retry delays', () => {
    const script = buildDefinitionAutoScrollScript();

    expect(script).not.toContain('setTimeout');
    expect(script).not.toMatch(/\b(250|750|1500)\b/);
  });

  it('does not install the observer more than once per page', () => {
    const documentValue = {
      querySelector: jest.fn(() => null),
    };
    const windowValue = {
      addEventListener: jest.fn(),
    };
    const observer = {
      disconnect: jest.fn(),
      observe: jest.fn(),
    };
    const mutationObserverValue = jest.fn(() => observer);

    runInjectedScript(
      documentValue,
      windowValue,
      mutationObserverValue,
    );
    runInjectedScript(
      documentValue,
      windowValue,
      mutationObserverValue,
    );

    expect(mutationObserverValue).toHaveBeenCalledTimes(1);
    expect(observer.observe).toHaveBeenCalledTimes(1);
  });

  it('ends with the WebView-compatible truthy expression', () => {
    expect(buildDefinitionAutoScrollScript()).toMatch(/true;\s*$/);
  });
});
