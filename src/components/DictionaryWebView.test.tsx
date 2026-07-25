import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { WORDS } from '../data/words';
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

describe('DictionaryWebView', () => {
  beforeEach(() => {
    mockInjectJavaScript.mockClear();
  });

  it('loads the selected Oxford URL', async () => {
    const screen = await render(<DictionaryWebView word={WORDS[1]} />);

    expect(screen.getByTestId('dictionary-webview')).toHaveProp('source', {
      uri: WORDS[1].oxfordUrl,
    });
  });

  it('shows loading on load start and clears it on load end', async () => {
    const screen = await render(<DictionaryWebView word={WORDS[1]} />);
    const webView = screen.getByTestId('dictionary-webview');

    expect(screen.queryByText('Loading Oxford page…')).toBeNull();

    await fireEvent(webView, 'loadStart');
    expect(screen.getByText('Loading Oxford page…')).toBeOnTheScreen();

    await fireEvent(webView, 'loadEnd');
    expect(screen.queryByText('Loading Oxford page…')).toBeNull();
  });

  it('shows a concise error when the WebView fails', async () => {
    const screen = await render(<DictionaryWebView word={WORDS[1]} />);
    const webView = screen.getByTestId('dictionary-webview');

    await fireEvent(webView, 'loadStart');
    await fireEvent(webView, 'error');
    await fireEvent(webView, 'loadEnd');

    expect(screen.getByText('Unable to load Oxford page.')).toBeOnTheScreen();
  });

  it('injects the confirmed UK pronunciation click script', async () => {
    const screen = await render(<DictionaryWebView word={WORDS[0]} />);

    await fireEvent.press(screen.getByRole('button', { name: 'UK Test' }));

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    const script = mockInjectJavaScript.mock.calls[0][0] as string;
    expect(script).toContain(
      '#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_br > .audio_play_button.pron-uk',
    );
    expect(script).toContain("postMessage('FOUND')");
    expect(script).toContain("postMessage('NOT_FOUND')");
    expect(script).toContain('element.click()');
  });

  it('injects the confirmed US pronunciation click script', async () => {
    const screen = await render(<DictionaryWebView word={WORDS[0]} />);

    await fireEvent.press(screen.getByRole('button', { name: 'US Test' }));

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    const script = mockInjectJavaScript.mock.calls[0][0] as string;
    expect(script).toContain(
      '#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_n_am > .audio_play_button.pron-us',
    );
  });

  it('logs messages returned by the injected script', async () => {
    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const screen = await render(<DictionaryWebView word={WORDS[0]} />);

    await fireEvent(screen.getByTestId('dictionary-webview'), 'message', {
      nativeEvent: { data: 'FOUND' },
    });

    expect(logSpy).toHaveBeenCalledWith('Oxford audio test:', 'FOUND');
    logSpy.mockRestore();
  });
});
