import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render } from '@testing-library/react-native';

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

  it('defaults to Oxford 3000 and disables switching while loading', async () => {
    const screen = await render(<App />);

    expect(screen.getByRole('button', { name: 'Oxford 3000' })).toHaveProp(
      'accessibilityState',
      { disabled: true, selected: true },
    );
    expect(screen.getByRole('button', { name: 'Oxford 5000' })).toBeDisabled();
  });

  it('enables switching after the word list loads and its filter succeeds', async () => {
    const screen = await render(<App />);
    const webView = screen.getByTestId('oxford-word-list-webview');

    await fireEvent(webView, 'loadEnd');
    await fireFilterMessage(webView, {
      type: 'WORD_LIST_FILTER_APPLIED',
      wordListId: 'ox3000',
    });

    expect(
      screen.getByRole('button', { name: 'Oxford 5000' }),
    ).not.toBeDisabled();
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

  it('shows a new selection only after its filter succeeds', async () => {
    const screen = await render(<App />);
    const webView = screen.getByTestId('oxford-word-list-webview');

    await fireEvent(webView, 'loadEnd');
    await fireFilterMessage(webView, {
      type: 'WORD_LIST_FILTER_APPLIED',
      wordListId: 'ox3000',
    });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Oxford 5000' }),
    );

    expect(
      screen.getByRole('button', { name: 'Oxford 3000' }),
    ).toHaveProp('accessibilityState', {
      disabled: false,
      selected: true,
    });

    await fireFilterMessage(webView, {
      type: 'WORD_LIST_FILTER_APPLIED',
      wordListId: 'ox5000',
    });

    expect(
      screen.getByRole('button', { name: 'Oxford 5000' }),
    ).toHaveProp('accessibilityState', {
      disabled: false,
      selected: true,
    });
  });

  it('keeps the last applied selection and reports a filter failure', async () => {
    const screen = await render(<App />);
    const webView = screen.getByTestId('oxford-word-list-webview');

    await fireEvent(webView, 'loadEnd');
    await fireFilterMessage(webView, {
      type: 'WORD_LIST_FILTER_APPLIED',
      wordListId: 'ox3000',
    });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Oxford 5000' }),
    );
    await fireFilterMessage(webView, {
      type: 'WORD_LIST_FILTER_FAILED',
      wordListId: 'ox5000',
      reason: 'WORD_LIST_DOM_NOT_FOUND',
    });

    expect(
      screen.getByRole('button', { name: 'Oxford 3000' }),
    ).toHaveProp('accessibilityState', {
      disabled: false,
      selected: true,
    });
    expect(
      screen.getByText('无法切换词库，Oxford 页面结构可能已变化。'),
    ).toBeOnTheScreen();
  });
});
