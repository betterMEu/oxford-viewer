export type WordListState = { type: 'WORD_LIST_STATE'; letters: string[] };

export function buildWordListBridgeScript(): string {
  return `
    (function () {
      if (window.__oxfordWordListBridge) { window.__oxfordWordListBridge(); return; }
      var previous = '';
      function report() {
        var letters = [];
        document.querySelectorAll('#wordlistsContentPanel li[data-hw]').forEach(function (item) {
          if (!item.getClientRects().length || getComputedStyle(item).visibility === 'hidden') return;
          var letter = (item.getAttribute('data-hw') || '').trim().charAt(0).toUpperCase();
          if (/^[A-Z]$/.test(letter) && letters.indexOf(letter) < 0) letters.push(letter);
        });
        var message = JSON.stringify({ type: 'WORD_LIST_STATE', letters: letters.sort() });
        if (message !== previous) { previous = message; window.ReactNativeWebView.postMessage(message); }
      }
      window.__oxfordWordListBridge = function () { previous = ''; report(); };
      document.addEventListener('click', function (event) {
        var link = event.target.closest && event.target.closest('#wordlistsContentPanel li[data-hw] a[href]');
        if (!link || event.defaultPrevented || event.button > 0) return;
        var url = new URL(link.href, location.href);
        if (url.origin !== 'https://www.oxfordlearnersdictionaries.com' ||
            !url.pathname.startsWith('/definition/english/')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WORD_LIST_ENTRY', url: url.href }));
      }, true);
      var queued = false;
      function schedule() {
        if (queued) return;
        queued = true;
        setTimeout(function () { queued = false; report(); }, 0);
      }
      new MutationObserver(schedule).observe(document, {
        subtree: true, childList: true, attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'data-hw']
      });
      document.addEventListener('change', schedule);
      window.addEventListener('resize', schedule);
      window.addEventListener('load', schedule);
      report();
    })();
    true;
  `;
}
