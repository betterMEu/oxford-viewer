import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { DictionaryWebView } from './DictionaryWebView';

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

const DEFINITION_URL =
  'https://www.oxfordlearnersdictionaries.com/definition/english/abandon_1';

describe('DictionaryWebView', () => {
  it('loads the explicit Oxford definition URL', async () => {
    const screen = await render(<DictionaryWebView url={DEFINITION_URL} />);

    expect(screen.getByTestId('dictionary-webview')).toHaveProp('source', {
      uri: DEFINITION_URL,
    });
  });

  it('shows loading on load start and clears it on load end', async () => {
    const screen = await render(<DictionaryWebView url={DEFINITION_URL} />);
    const webView = screen.getByTestId('dictionary-webview');

    expect(screen.queryByText('Loading Oxford page…')).toBeNull();

    await fireEvent(webView, 'loadStart');
    expect(screen.getByText('Loading Oxford page…')).toBeOnTheScreen();

    await fireEvent(webView, 'loadEnd');
    expect(screen.queryByText('Loading Oxford page…')).toBeNull();
  });

  it('shows a concise error when the WebView fails', async () => {
    const screen = await render(<DictionaryWebView url={DEFINITION_URL} />);
    const webView = screen.getByTestId('dictionary-webview');

    await fireEvent(webView, 'loadStart');
    await fireEvent(webView, 'error');
    await fireEvent(webView, 'loadEnd');

    expect(screen.getByText('Unable to load Oxford page.')).toBeOnTheScreen();
  });

  it('does not render temporary pronunciation test controls', async () => {
    const screen = await render(<DictionaryWebView url={DEFINITION_URL} />);

    expect(screen.queryByRole('button', { name: 'UK Test' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'US Test' })).toBeNull();
  });
});
