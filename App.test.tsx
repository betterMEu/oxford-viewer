import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import App from './App';
import { WORDS } from './src/data/words';

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

jest.mock('react-native-safe-area-context', () => {
  const mock = jest.requireActual(
    'react-native-safe-area-context/jest/mock',
  ) as { default: object };

  return mock.default;
});

describe('App', () => {
  it('renders without the deprecated React Native SafeAreaView warning', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      await render(<App />);

      expect(warn.mock.calls.flat().join(' ')).not.toContain(
        'SafeAreaView has been deprecated',
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('updates the Oxford page when a word is selected', async () => {
    const screen = await render(<App />);

    await fireEvent.press(screen.getByText('curious'));

    expect(screen.getByTestId('dictionary-webview')).toHaveProp('source', {
      uri: WORDS[2].oxfordUrl,
    });
  });

});
