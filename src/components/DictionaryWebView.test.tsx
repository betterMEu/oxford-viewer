import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { DictionaryWebView } from './DictionaryWebView';

const mockInjectJavaScript = jest.fn();

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  class MockWebView extends React.Component {
    injectJavaScript = mockInjectJavaScript;

    render() {
      return React.createElement(View, this.props);
    }
  }

  return { WebView: MockWebView };
});

const DEFINITION_URL =
  'https://www.oxfordlearnersdictionaries.com/definition/english/abandon_1';
const DEFAULT_LAYOUT_PROPS = {
  paneWidth: 320,
  shrinkToFit: false,
  topInset: 0,
} as const;

describe('DictionaryWebView', () => {
  beforeEach(() => {
    mockInjectJavaScript.mockClear();
  });

  it('loads the explicit Oxford definition URL', async () => {
    const screen = await render(
      <DictionaryWebView
        {...DEFAULT_LAYOUT_PROPS}
        url={DEFINITION_URL}
      />,
    );

    expect(screen.getByTestId('dictionary-webview')).toHaveProp('source', {
      uri: DEFINITION_URL,
    });
  });

  it('does not show a loading status when a definition starts loading', async () => {
    const screen = await render(
      <DictionaryWebView
        {...DEFAULT_LAYOUT_PROPS}
        url={DEFINITION_URL}
      />,
    );
    const webView = screen.getByTestId('dictionary-webview');

    await fireEvent(webView, 'loadStart');

    expect(screen.queryByText('Loading Oxford page…')).toBeNull();
  });

  it('shows a concise error when the WebView fails', async () => {
    const screen = await render(
      <DictionaryWebView
        {...DEFAULT_LAYOUT_PROPS}
        url={DEFINITION_URL}
      />,
    );
    const webView = screen.getByTestId('dictionary-webview');

    await fireEvent(webView, 'loadStart');
    await fireEvent(webView, 'error');

    expect(screen.getByText('Unable to load Oxford page.')).toBeOnTheScreen();
  });

  it('scrolls to the dictionary entry after a successful load', async () => {
    const screen = await render(
      <DictionaryWebView
        paneWidth={200}
        shrinkToFit
        topInset={47}
        url={DEFINITION_URL}
      />,
    );
    const webView = screen.getByTestId('dictionary-webview');

    await fireEvent(webView, 'loadStart');
    await fireEvent(webView, 'loadEnd');

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      'oxford-viewer-definition-page-scale',
    );
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      "document.querySelector('#entryContent')",
    );
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      'var topInset = 47;',
    );
  });

  it('installs portrait scaling and safe auto-scroll before content loads', async () => {
    const screen = await render(
      <DictionaryWebView
        paneWidth={200}
        shrinkToFit
        topInset={47}
        url={DEFINITION_URL}
      />,
    );

    expect(screen.getByTestId('dictionary-webview')).toHaveProp(
      'injectedJavaScriptBeforeContentLoaded',
      expect.stringContaining(
        'oxford-viewer-definition-page-scale',
      ),
    );
    expect(
      screen.getByTestId('dictionary-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).toEqual(
      expect.stringContaining(
        "document.querySelector('#entryContent')",
      ),
    );
    expect(
      screen.getByTestId('dictionary-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).toContain('var topInset = 47;');
  });

  it('removes portrait scaling after a loaded page rotates to landscape', async () => {
    const screen = await render(
      <DictionaryWebView
        paneWidth={200}
        shrinkToFit
        topInset={47}
        url={DEFINITION_URL}
      />,
    );
    const webView = screen.getByTestId('dictionary-webview');

    await fireEvent(webView, 'loadStart');
    await fireEvent(webView, 'loadEnd');
    mockInjectJavaScript.mockClear();

    await screen.rerender(
      <DictionaryWebView
        paneWidth={480}
        shrinkToFit={false}
        topInset={0}
        url={DEFINITION_URL}
      />,
    );

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      'var scale = 1;',
    );
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      'oxford-viewer-definition-page-scale',
    );
  });

  it('does not auto-scroll when the definition load fails', async () => {
    const screen = await render(
      <DictionaryWebView
        {...DEFAULT_LAYOUT_PROPS}
        url={DEFINITION_URL}
      />,
    );
    const webView = screen.getByTestId('dictionary-webview');

    await fireEvent(webView, 'loadStart');
    await fireEvent(webView, 'error');
    await fireEvent(webView, 'loadEnd');

    expect(mockInjectJavaScript).not.toHaveBeenCalled();
  });

  it('clears an error without showing loading status on the next load', async () => {
    const screen = await render(
      <DictionaryWebView
        {...DEFAULT_LAYOUT_PROPS}
        url={DEFINITION_URL}
      />,
    );
    const webView = screen.getByTestId('dictionary-webview');

    await fireEvent(webView, 'error');
    await fireEvent(webView, 'loadStart');

    expect(screen.queryByText('Unable to load Oxford page.')).toBeNull();
    expect(screen.queryByText('Loading Oxford page…')).toBeNull();
  });

  it('does not render temporary pronunciation test controls', async () => {
    const screen = await render(
      <DictionaryWebView
        {...DEFAULT_LAYOUT_PROPS}
        url={DEFINITION_URL}
      />,
    );

    expect(screen.queryByRole('button', { name: 'UK Test' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'US Test' })).toBeNull();
  });
});
