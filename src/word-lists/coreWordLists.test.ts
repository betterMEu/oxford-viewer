import { describe, expect, it } from '@jest/globals';

import {
  CORE_WORD_LISTS,
  DEFAULT_CORE_WORD_LIST,
  OXFORD_WORD_LIST_URL,
} from './coreWordLists';

describe('Oxford core word list configuration', () => {
  it('defines exactly the three core list options in display order', () => {
    expect(CORE_WORD_LISTS).toHaveLength(3);
    expect(CORE_WORD_LISTS.map(({ id }) => id)).toEqual([
      'ox3000',
      'ox5000',
      'ox5000Diff',
    ]);
  });

  it('defaults to Oxford 3000', () => {
    expect(DEFAULT_CORE_WORD_LIST).toBe('ox3000');
  });

  it('uses one official Oxford word list URL for every option', () => {
    expect(OXFORD_WORD_LIST_URL).toBe(
      'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000',
    );
    expect(CORE_WORD_LISTS.map(() => OXFORD_WORD_LIST_URL)).toEqual([
      OXFORD_WORD_LIST_URL,
      OXFORD_WORD_LIST_URL,
      OXFORD_WORD_LIST_URL,
    ]);
  });
});
