// Keep playback in Oxford's player and in the user's synchronous click event.
export const PRONUNCIATION_SCRIPT = `
  (function () {
    if (window.__oxfordPronunciationInstalled) return;
    window.__oxfordPronunciationInstalled = true;
    document.addEventListener('click', function (event) {
      var target = event.target;
      var button = target && target.closest
        ? target.closest('.audio_play_button.pron-uk, .audio_play_button.pron-us')
        : null;
      if (!button || typeof window.playSound !== 'function' ||
          typeof window.jQuery !== 'function') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.playSound(window.jQuery(button));
    }, true);
  })();
  true;
`;
