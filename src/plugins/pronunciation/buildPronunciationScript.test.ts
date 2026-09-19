import { describe, expect, it, jest } from '@jest/globals';
import { PRONUNCIATION_SCRIPT } from './buildPronunciationScript';

describe('Oxford pronunciation click bridge', () => {
  it('cancels the previous word even when its audio finishes loading late', () => {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(`
      <div class="audio_play_button pron-uk" data-src-mp3="abandon.mp3"></div>
      <div class="audio_play_button pron-us" data-src-mp3="ability.mp3"><span>US</span></div>
    `, { runScripts: 'outside-only' });
    const played: string[] = [];
    const audios: any[] = [];
    dom.window.Audio = function (src: string) {
      const audio = {
        src, pending: false,
        canPlayType: () => 'probably',
        addEventListener: () => {},
        play() { this.pending = true; return Promise.resolve(); },
        pause() { this.pending = false; },
        finishLoading() { if (this.pending) played.push(this.src); },
      };
      audios.push(audio);
      return audio;
    };
    dom.window.HTMLMediaElement.prototype.canPlayType = () => 'probably';
    dom.window.jQuery = (element: Element) => ({ attr: (name: string) => element.getAttribute(name) });
    // Oxford common.js v2.3.78: exercise its real player, not a playSound spy.
    dom.window.eval(require('fs').readFileSync(
      require('path').join(__dirname, 'fixtures/oxford-player.js'), 'utf8'));
    try {
      dom.window.eval(PRONUNCIATION_SCRIPT);
      dom.window.document.querySelector('.pron-uk').click();
      dom.window.document.querySelector('span').click();
      audios.filter(audio => audio.src).reverse().forEach(audio => audio.finishLoading());
      expect(played).toEqual(['ability.mp3']);
    } finally {
      dom.window.close();
    }
  });
  it.each([false, true])('plays once (original handler bound: %s)', (bound) => {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<div class="audio_play_button pron-uk" data-src-mp3="uk.mp3"><span>UK</span></div>', {
      runScripts: 'outside-only',
    });
    const button = dom.window.document.querySelector('div');
    dom.window.jQuery = (element: unknown) => element;
    dom.window.playSound = jest.fn();
    const play = jest.fn(() => Promise.resolve());
    const pause = jest.fn();
    dom.window.Audio = jest.fn(() => ({ play, pause }));
    if (bound) button.addEventListener('click', () => dom.window.playSound(button));
    try {
      dom.window.eval(PRONUNCIATION_SCRIPT);
      dom.window.eval(PRONUNCIATION_SCRIPT);
      button.querySelector('span').click();
      expect(play).toHaveBeenCalledTimes(1);
      expect(dom.window.Audio).toHaveBeenLastCalledWith('uk.mp3');
      button.className = 'audio_play_button pron-us';
      button.setAttribute('data-src-mp3', 'us.mp3');
      button.click();
      expect(play).toHaveBeenCalledTimes(2);
      expect(pause).toHaveBeenCalledTimes(1);
      expect(dom.window.Audio).toHaveBeenLastCalledWith('us.mp3');
      expect(dom.window.playSound).not.toHaveBeenCalled();
    } finally {
      dom.window.close();
    }
  });
});
