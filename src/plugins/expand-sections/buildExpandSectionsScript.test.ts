import { expect, it } from '@jest/globals';
import { EXPAND_SECTIONS_SCRIPT } from './buildExpandSectionsScript';

it.each([false, true])('toggles sections once with original handlers present: %s', (bound) => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<div class="unbox"><span class="box_title"><b>Verb Forms</b></span><div class="body"><a href="#word">word</a></div></div><div class="unbox"><span class="heading">Extra Examples</span></div>', { runScripts: 'outside-only' });
  const doc = dom.window.document;
  const boxes = doc.querySelectorAll('.unbox');
  try {
    if (bound) doc.querySelector('.box_title').addEventListener('click', () => boxes[0].classList.toggle('is-active'));
    dom.window.eval(EXPAND_SECTIONS_SCRIPT);
    dom.window.eval(EXPAND_SECTIONS_SCRIPT);
    doc.querySelector('b').click();
    expect(boxes[0].classList.contains('is-active')).toBe(true);
    doc.querySelector('b').click();
    expect(boxes[0].classList.contains('is-active')).toBe(false);
    doc.querySelector('.heading').click();
    expect(boxes[1].classList.contains('is-active')).toBe(true);
    const event = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true });
    doc.querySelector('a').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(boxes[0].classList.contains('is-active')).toBe(false);
  } finally { dom.window.close(); }
});
