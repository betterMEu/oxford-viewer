import { describe, expect, it, jest } from '@jest/globals';
import { PRONUNCIATION_SCRIPT } from './buildPronunciationScript';

describe('Oxford pronunciation click bridge', () => {
  it.each([false, true])('calls the Oxford player once (original handler bound: %s)', (bound) => {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<div class="audio_play_button pron-uk"><span>UK</span></div>', {
      runScripts: 'outside-only',
    });
    const button = dom.window.document.querySelector('div');
    dom.window.jQuery = (element: unknown) => element;
    dom.window.playSound = jest.fn();
    if (bound) button.addEventListener('click', () => dom.window.playSound(button));
    try {
      dom.window.eval(PRONUNCIATION_SCRIPT);
      dom.window.eval(PRONUNCIATION_SCRIPT);
      button.querySelector('span').click();
      expect(dom.window.playSound).toHaveBeenCalledTimes(1);
      expect(dom.window.playSound).toHaveBeenCalledWith(button);
      button.className = 'audio_play_button pron-us';
      button.click();
      expect(dom.window.playSound).toHaveBeenCalledTimes(2);
    } finally {
      dom.window.close();
    }
  });
});
