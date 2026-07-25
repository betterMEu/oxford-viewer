import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { WORDS } from '../data/words';
import { DictionaryWebView } from './DictionaryWebView';

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

describe('DictionaryWebView', () => {
  it('loads the selected Oxford URL', async () => {
    const screen = await render(<DictionaryWebView word={WORDS[1]} />);

    expect(screen.getByTestId('dictionary-webview')).toHaveProp('source', {
      uri: WORDS[1].oxfordUrl,
    });
  });
});
