import type { CoreWordListId } from './coreWordLists';

export type WordListWebMessage =
  | {
      type: 'WORD_LIST_FILTER_APPLIED';
      wordListId: CoreWordListId;
    }
  | {
      type: 'WORD_LIST_FILTER_FAILED';
      wordListId: CoreWordListId;
      reason: 'WORD_LIST_DOM_NOT_FOUND';
    };

const FILTER_STYLE_ID = 'oxford-viewer-core-word-list-filter';

const FILTER_CSS = `
html[data-oxford-viewer-list="ox3000"] li[data-hw][data-ox3000] {
  display: list-item !important;
}
html[data-oxford-viewer-list="ox3000"] li[data-hw]:not([data-ox3000]) {
  display: none !important;
}
html[data-oxford-viewer-list="ox5000"] li[data-hw][data-ox5000] {
  display: list-item !important;
}
html[data-oxford-viewer-list="ox5000"] li[data-hw]:not([data-ox5000]) {
  display: none !important;
}
html[data-oxford-viewer-list="ox5000Diff"] li[data-hw][data-ox5000]:not([data-ox3000]) {
  display: list-item !important;
}
html[data-oxford-viewer-list="ox5000Diff"] li[data-hw]:not([data-ox5000]),
html[data-oxford-viewer-list="ox5000Diff"] li[data-hw][data-ox3000] {
  display: none !important;
}
`;

export function buildWordListFilterScript(
  wordListId: CoreWordListId,
): string {
  return `
    (function () {
      var wordListId = '${wordListId}';
      var items = document.querySelectorAll('li[data-hw]');

      if (items.length === 0) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'WORD_LIST_FILTER_FAILED',
          wordListId: wordListId,
          reason: 'WORD_LIST_DOM_NOT_FOUND'
        }));
        return;
      }

      var style = document.getElementById('${FILTER_STYLE_ID}');
      if (!style) {
        style = document.createElement('style');
        style.id = '${FILTER_STYLE_ID}';
        style.textContent = \`${FILTER_CSS}\`;
        document.head.appendChild(style);
      }

      document.documentElement.dataset.oxfordViewerList = wordListId;
      window.scrollTo(0, 0);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'WORD_LIST_FILTER_APPLIED',
        wordListId: wordListId
      }));
    })();
    true;
  `;
}
