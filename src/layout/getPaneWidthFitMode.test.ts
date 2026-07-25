import { describe, expect, it } from '@jest/globals';

import { getPaneWidthFitMode } from './getPaneWidthFitMode';

describe('getPaneWidthFitMode', () => {
  it('fits the definition pane in portrait', () => {
    expect(getPaneWidthFitMode(390, 844)).toEqual({
      fitDictionary: true,
      fitWordList: false,
    });
  });

  it('fits the word-list pane in landscape', () => {
    expect(getPaneWidthFitMode(844, 390)).toEqual({
      fitDictionary: false,
      fitWordList: true,
    });
  });
});
