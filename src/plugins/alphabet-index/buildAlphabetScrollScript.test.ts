import { describe, expect, it } from '@jest/globals';

import { buildAlphabetScrollScript } from './buildAlphabetScrollScript';

describe('buildAlphabetScrollScript', () => {
  it('targets the first visible native word list entry for the requested letter', () => {
    const script = buildAlphabetScrollScript('B');

    expect(script).toContain("var requestedLetter = 'B';");
    expect(script).toContain(
      "document.querySelectorAll('#wordlistsContentPanel li[data-hw]')",
    );
    expect(script).toContain("getAttribute('data-hw')");
    expect(script).toContain("item.getClientRects().length > 0");
  });

  it('scrolls to the target current document position', () => {
    const script = buildAlphabetScrollScript('Z');

    expect(script).toContain(
      'target.getBoundingClientRect().top + window.scrollY',
    );
    expect(script).toContain('window.scrollTo(0, targetTop)');
  });

  it('does not scroll when no matching entry exists', () => {
    const script = buildAlphabetScrollScript('X');

    expect(script).toContain('if (!target)');
    expect(script).toContain('return;');
  });

  it('ends with the WebView-compatible truthy expression', () => {
    expect(buildAlphabetScrollScript('A')).toMatch(/true;\s*$/);
  });
});
