import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StatusBar } from 'expo-status-bar';

import App from './App';

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

jest.mock('react-native-safe-area-context', () => {
  const mock = jest.requireActual(
    'react-native-safe-area-context/jest/mock',
  ) as { default: object };

  return mock.default;
});

const fireFilterMessage = async (
  webView: ReturnType<typeof render>['getByTestId'] extends (
    testId: string,
  ) => infer Result
    ? Result
    : never,
  message: object,
) => {
  await fireEvent(webView, 'message', {
    nativeEvent: { data: JSON.stringify(message) },
  });
};

describe('App', () => {
  beforeEach(() => {
    mockInjectJavaScript.mockClear();
  });

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

  it('fills the top and bottom screen edges', async () => {
    const screen = await render(<App />);

    expect(screen.getByTestId('app-safe-area')).toHaveProp('edges', {
      bottom: 'off',
      left: 'additive',
      right: 'additive',
      top: 'off',
    });
  });

  it('hides the system status bar above the edge-to-edge layout', async () => {
    const screen = await render(<App />);

    expect(screen.UNSAFE_getByType(StatusBar).props.hidden).toBe(true);
  });

  it('does not adjust either Oxford page size', async () => {
    const screen = await render(<App />);

    expect(
      screen.getByTestId('dictionary-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).not.toContain('oxford-viewer-pane-width-fit');
    expect(
      screen.getByTestId('oxford-word-list-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).toBeUndefined();
  });

  it('does not render core word list switching buttons', async () => {
    const screen = await render(<App />);

    expect(
      screen.queryByRole('button', { name: 'Oxford 3000' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Oxford 5000' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', {
        name: 'Oxford 5000 excluding Oxford 3000',
      }),
    ).toBeNull();
  });

  it('enables the alphabet index after filtering and scrolls to a letter', async () => {
    const screen = await render(<App />);
    const webView = screen.getByTestId('oxford-word-list-webview');
    const bButton = screen.getByRole('button', { name: 'B' });

    expect(bButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'X' })).toBeDisabled();

    await fireEvent(webView, 'loadEnd');
    await fireFilterMessage(webView, {
      type: 'WORD_LIST_FILTER_APPLIED',
      wordListId: 'ox3000',
    });

    expect(bButton).not.toBeDisabled();
    mockInjectJavaScript.mockClear();
    await fireEvent.press(bButton);

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      "var requestedLetter = 'B';",
    );
  });

  it('routes a top-level definition link to the right WebView', async () => {
    const screen = await render(<App />);
    const definitionUrl =
      'https://www.oxfordlearnersdictionaries.com/definition/english/abandon_1';
    const handleRequest = screen.getByTestId('oxford-word-list-webview')
      .props.onShouldStartLoadWithRequest;

    let shouldNavigate = true;
    await act(() => {
      shouldNavigate = handleRequest({
        url: definitionUrl,
        isTopFrame: true,
      });
    });

    expect(shouldNavigate).toBe(false);
    expect(screen.getByTestId('dictionary-webview')).toHaveProp('source', {
      uri: definitionUrl,
    });
  });

  it('reports a failure to apply the fixed Oxford 3000 filter', async () => {
    const screen = await render(<App />);
    const webView = screen.getByTestId('oxford-word-list-webview');

    await fireEvent(webView, 'loadEnd');
    await fireFilterMessage(webView, {
      type: 'WORD_LIST_FILTER_FAILED',
      wordListId: 'ox3000',
      reason: 'WORD_LIST_DOM_NOT_FOUND',
    });

    expect(
      screen.getByText(
        '无法显示 Oxford 3000，Oxford 页面结构可能已变化。',
      ),
    ).toBeOnTheScreen();
  });
});
