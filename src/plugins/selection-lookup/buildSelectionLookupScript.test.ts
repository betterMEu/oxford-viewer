import { describe, expect, it, jest } from '@jest/globals';
import { SELECTION_LOOKUP_SCRIPT } from './buildSelectionLookupScript';

describe('Oxford selected-word lookup', () => {
  it.each([false, true])('runs the lookup once (initial binding present: %s)', (bound) => {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<main id="main-container"><span>word</span></main>', {
      runScripts: 'outside-only',
      url: 'https://www.oxfordlearnersdictionaries.com/definition/english/abandon_1',
    });
    const area = dom.window.document.querySelector('main');
    const lookup = jest.fn();
    const handlers: Array<() => void> = [];
    dom.window.jQuery = () => ({
      off: () => {
        handlers.forEach((handler) => area.removeEventListener('dblclick', handler));
        handlers.length = 0;
      },
    });
    dom.window.setupDoubleClick = jest.fn(() => {
      const handler = () => lookup();
      handlers.push(handler);
      area.addEventListener('dblclick', handler);
    });
    if (bound) dom.window.setupDoubleClick();
    try {
      dom.window.eval(SELECTION_LOOKUP_SCRIPT);
      dom.window.eval(SELECTION_LOOKUP_SCRIPT);
      area.querySelector('span').dispatchEvent(new dom.window.MouseEvent('dblclick', { bubbles: true }));
      expect(lookup).toHaveBeenCalledTimes(1);
      expect(dom.window.setupDoubleClick).toHaveBeenLastCalledWith(
        'https://www.oxfordlearnersdictionaries.com/', 'english', false,
        'main-container', null, null, null,
      );
    } finally {
      dom.window.close();
    }
  });
});
