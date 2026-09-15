import { expect, it, jest } from '@jest/globals';
import { buildWordListBridgeScript } from './buildWordListBridgeScript';

it('preserves native filters and outside links, routes entries, and refreshes the index after filtering or reinjection', async () => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(`<select id="filterList"><option value="ox3000">Oxford 3000</option><option value="ox5000">Oxford 5000</option></select><a id="outside" href="/definition/english/outside">Outside</a><div id="wordlistsContentPanel"><ul><li data-hw="apple"><a href="/definition/english/apple"><span>apple</span></a></li><li data-hw="banana" style="display:none">banana</li></ul></div>`, { url: 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000', runScripts: 'outside-only' });
  const win = dom.window;
  const postMessage = jest.fn();
  win.ReactNativeWebView = { postMessage };
  win.HTMLElement.prototype.getClientRects = function () { return this.style.display === 'none' ? [] : [{}]; };
  const state = () => JSON.parse(String(postMessage.mock.calls.at(-1)?.[0]));
  try {
    win.eval(buildWordListBridgeScript());
    expect(win.document.querySelector('#filterList').value).toBe('ox3000');
    expect(state()).toEqual({ type: 'WORD_LIST_STATE', letters: ['A'] });
    const outside = new win.MouseEvent('click', { bubbles: true, cancelable: true });
    win.document.querySelector('#outside').addEventListener('click', (event: Event) => {
      expect(event.defaultPrevented).toBe(false);
      event.preventDefault(); // Avoid jsdom navigation; native handlers still receive the click.
    });
    win.document.querySelector('#outside').dispatchEvent(outside);
    expect(postMessage).toHaveBeenCalledTimes(1);
    win.document.querySelector('li a span').click();
    expect(state()).toEqual({ type: 'WORD_LIST_ENTRY', url: 'https://www.oxfordlearnersdictionaries.com/definition/english/apple' });
    win.document.querySelector('[data-hw=apple]').style.display = 'none';
    win.document.querySelector('[data-hw=banana]').style.display = '';
    win.document.querySelector('#filterList').value = 'ox5000';
    win.document.querySelector('#filterList').dispatchEvent(new win.Event('change', { bubbles: true }));
    await new Promise(resolve => win.setTimeout(resolve, 20));
    expect(state()).toEqual({ type: 'WORD_LIST_STATE', letters: ['B'] });
    expect(win.document.querySelector('#filterList').value).toBe('ox5000');
    postMessage.mockClear();
    win.eval(buildWordListBridgeScript());
    expect(state()).toEqual({ type: 'WORD_LIST_STATE', letters: ['B'] });
    win.document.querySelector('li a span').click();
    expect(postMessage).toHaveBeenCalledTimes(2);
  } finally { win.close(); }
});
