export type CoreWordListId = 'ox3000' | 'ox5000' | 'ox5000Diff';

export type CoreWordListOption = {
  id: CoreWordListId;
  shortLabel: string;
  accessibilityLabel: string;
};

export const OXFORD_WORD_LIST_URL =
  'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000';

export const DEFAULT_CORE_WORD_LIST: CoreWordListId = 'ox3000';

export const CORE_WORD_LISTS: readonly CoreWordListOption[] = [
  {
    id: 'ox3000',
    shortLabel: '3000',
    accessibilityLabel: 'Oxford 3000',
  },
  {
    id: 'ox5000',
    shortLabel: '5000',
    accessibilityLabel: 'Oxford 5000',
  },
  {
    id: 'ox5000Diff',
    shortLabel: '5000 增补',
    accessibilityLabel: 'Oxford 5000 excluding Oxford 3000',
  },
];
