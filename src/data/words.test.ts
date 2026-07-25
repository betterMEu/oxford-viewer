import { describe, expect, it } from '@jest/globals';

import { WORDS } from './words';

describe('WORDS', () => {
  it('contains five Oxford entries with only the allowed fields', () => {
    expect(WORDS).toHaveLength(5);

    for (const entry of WORDS) {
      expect(Object.keys(entry).sort()).toEqual(['oxfordUrl', 'word']);
      expect(entry.oxfordUrl).toMatch(
        /^https:\/\/www\.oxfordlearnersdictionaries\.com\/definition\/english\//,
      );
    }
  });
});
