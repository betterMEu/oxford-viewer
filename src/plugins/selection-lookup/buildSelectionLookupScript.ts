// Bind Oxford's own selection lookup before the double-click reaches the entry.
export const SELECTION_LOOKUP_SCRIPT = `
  (function () {
    if (window.__oxfordSelectionLookupInstalled) return;
    window.__oxfordSelectionLookupInstalled = true;
    document.addEventListener('dblclick', function (event) {
      var target = event.target;
      if (!target || !target.closest || !target.closest('#main-container') ||
          target.closest('a, button, input, textarea, select, .audio_play_button') ||
          event.button === 2 || typeof window.setupDoubleClick !== 'function' ||
          typeof window.jQuery !== 'function') return;
      window.jQuery('#main-container').off('dblclick');
      window.setupDoubleClick(
        'https://www.oxfordlearnersdictionaries.com/', 'english', false,
        'main-container', null, null, null
      );
    }, true);
  })();
  true;
`;
