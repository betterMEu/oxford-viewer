// Keep only the latest pronunciation, including while earlier audio is loading.
export const PRONUNCIATION_SCRIPT = `
  (function () {
    if (window.__oxfordPronunciationInstalled) return;
    window.__oxfordPronunciationInstalled = true;
    var audio = null;
    document.addEventListener('click', function (event) {
      var target = event.target;
      var button = target && target.closest
        ? target.closest('.audio_play_button.pron-uk, .audio_play_button.pron-us')
        : null;
      if (!button) return;
      var src = button.getAttribute('data-src-mp3') || button.getAttribute('data-src-ogg');
      if (!src) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (audio) audio.pause();
      audio = new Audio(src);
      var playback = audio.play();
      if (playback && playback.catch) playback.catch(function () {});
    }, true);
  })();
  true;
`;
