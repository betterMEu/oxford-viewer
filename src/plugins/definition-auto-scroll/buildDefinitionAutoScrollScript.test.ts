import { describe, expect, it } from '@jest/globals';

import { buildDefinitionAutoScrollScript } from './buildDefinitionAutoScrollScript';

type ScrollTarget = {
  scrollIntoView: jest.Mock;
};

function runInjectedScript(
  documentValue: {
    querySelector: jest.Mock;
  },
  setTimeoutValue: jest.Mock,
) {
  const execute = new Function(
    'document',
    'setTimeout',
    buildDefinitionAutoScrollScript(),
  );

  execute(documentValue, setTimeoutValue);
}

describe('buildDefinitionAutoScrollScript', () => {
  it('targets the verified Oxford dictionary entry container', () => {
    const script = buildDefinitionAutoScrollScript();

    expect(script).toContain(
      "document.querySelector('#entryContent')",
    );
  });

  it('scrolls the entry into view immediately and after bounded delays', () => {
    const target: ScrollTarget = {
      scrollIntoView: jest.fn(),
    };
    const scheduledCallbacks: Array<() => void> = [];
    const setTimeoutValue = jest.fn(
      (callback: () => void, _delay: number) => {
        scheduledCallbacks.push(callback);
      },
    );
    const documentValue = {
      querySelector: jest.fn(() => target),
    };

    runInjectedScript(documentValue, setTimeoutValue);

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(setTimeoutValue.mock.calls.map((call) => call[1])).toEqual([
      250,
      750,
      1500,
    ]);

    scheduledCallbacks.forEach((callback) => callback());

    expect(target.scrollIntoView).toHaveBeenCalledTimes(4);
    expect(target.scrollIntoView).toHaveBeenLastCalledWith({
      block: 'start',
      behavior: 'auto',
    });
  });

  it('can find the entry after the initial load callback', () => {
    const target: ScrollTarget = {
      scrollIntoView: jest.fn(),
    };
    const scheduledCallbacks: Array<() => void> = [];
    const setTimeoutValue = jest.fn(
      (callback: () => void, _delay: number) => {
        scheduledCallbacks.push(callback);
      },
    );
    const documentValue = {
      querySelector: jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValue(target),
    };

    runInjectedScript(documentValue, setTimeoutValue);

    expect(target.scrollIntoView).not.toHaveBeenCalled();

    scheduledCallbacks.forEach((callback) => callback());

    expect(target.scrollIntoView).toHaveBeenCalledTimes(3);
  });

  it('does not scroll when the entry container remains absent', () => {
    const scheduledCallbacks: Array<() => void> = [];
    const setTimeoutValue = jest.fn(
      (callback: () => void, _delay: number) => {
        scheduledCallbacks.push(callback);
      },
    );
    const documentValue = {
      querySelector: jest.fn(() => null),
    };

    runInjectedScript(documentValue, setTimeoutValue);
    scheduledCallbacks.forEach((callback) => callback());

    expect(documentValue.querySelector).toHaveBeenCalledTimes(4);
    expect(setTimeoutValue).toHaveBeenCalledTimes(3);
  });

  it('ends with the WebView-compatible truthy expression', () => {
    expect(buildDefinitionAutoScrollScript()).toMatch(/true;\s*$/);
  });
});
