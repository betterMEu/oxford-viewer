import { describe, expect, it } from '@jest/globals';

import { buildWordListFilterScript } from './buildWordListFilterScript';

const STYLE_ID = 'oxford-viewer-core-word-list-filter';

describe('buildWordListFilterScript', () => {
  it('creates one reusable style containing the three required hide rules', () => {
    const script = buildWordListFilterScript('ox3000');

    expect(script).toContain(STYLE_ID);
    expect(script).toContain(`document.getElementById('${STYLE_ID}')`);
    expect(script).toContain(
      'html[data-oxford-viewer-list="ox3000"] li[data-hw]:not([data-ox3000])',
    );
    expect(script).toContain(
      'html[data-oxford-viewer-list="ox5000"] li[data-hw]:not([data-ox5000])',
    );
    expect(script).toContain(
      'html[data-oxford-viewer-list="ox5000Diff"] li[data-hw]:not([data-ox5000])',
    );
    expect(script).toContain(
      'html[data-oxford-viewer-list="ox5000Diff"] li[data-hw][data-ox3000]',
    );
  });

  it('explicitly shows matching items to override Oxford hidden classes', () => {
    const script = buildWordListFilterScript('ox5000');

    expect(script).toContain(
      'html[data-oxford-viewer-list="ox3000"] li[data-hw][data-ox3000]',
    );
    expect(script).toContain(
      'html[data-oxford-viewer-list="ox5000"] li[data-hw][data-ox5000]',
    );
    expect(script).toContain(
      'html[data-oxford-viewer-list="ox5000Diff"] li[data-hw][data-ox5000]:not([data-ox3000])',
    );
    expect(script).toContain('display: list-item !important;');
  });

  it.each(['ox3000', 'ox5000', 'ox5000Diff'] as const)(
    'sets and reports the requested %s mode',
    (wordListId) => {
      const script = buildWordListFilterScript(wordListId);

      expect(script).toContain(`var wordListId = '${wordListId}';`);
      expect(script).toContain(
        'document.documentElement.dataset.oxfordViewerList = wordListId;',
      );
      expect(script).toContain('window.ReactNativeWebView.postMessage');
      expect(script).toContain("type: 'WORD_LIST_FILTER_APPLIED'");
      expect(script).toContain('window.scrollTo(0, 0);');
    },
  );

  it('reports a specific failure when the Oxford word list DOM is absent', () => {
    const script = buildWordListFilterScript('ox3000');

    expect(script).toContain("document.querySelectorAll('li[data-hw]')");
    expect(script).toContain("type: 'WORD_LIST_FILTER_FAILED'");
    expect(script).toContain("reason: 'WORD_LIST_DOM_NOT_FOUND'");
  });

  it('ends with a true expression for WebView compatibility', () => {
    expect(buildWordListFilterScript('ox3000')).toMatch(/true;\s*$/);
  });
});
