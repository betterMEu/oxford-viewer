import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StatusBar } from 'expo-status-bar';

import App from './App';

const mockInjectJavaScript = jest.fn();
const mockUseWindowDimensions = jest.fn(() => ({
  fontScale: 1,
  height: 844,
  scale: 3,
  width: 390,
}));

jest.mock(
  'react-native/Libraries/Utilities/useWindowDimensions',
  () => ({
    __esModule: true,
    default: mockUseWindowDimensions,
  }),
);

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

  return {
    ...mock.default,
    useSafeAreaInsets: () => ({
      bottom: 34,
      left: 0,
      right: 0,
      top: 47,
    }),
  };
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
    mockUseWindowDimensions.mockReturnValue({
      fontScale: 1,
      height: 844,
      scale: 3,
      width: 390,
    });
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

  it('configures portrait scaling only for the definition page', async () => {
    const screen = await render(<App />);

    expect(
      screen.getByTestId('dictionary-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).toContain('oxford-viewer-definition-page-scale');
    expect(
      screen.getByTestId('dictionary-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).toContain('var scale = 0.6788;');
    expect(
      screen.getByTestId('dictionary-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).toContain('var topInset = 47;');
    expect(
      screen.getByTestId('oxford-word-list-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).not.toContain('viewport');
  });

  it('uses Oxford native definition scale in landscape', async () => {
    mockUseWindowDimensions.mockReturnValue({
      fontScale: 1,
      height: 390,
      scale: 3,
      width: 844,
    });

    const screen = await render(<App />);

    expect(
      screen.getByTestId('dictionary-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).toContain('var scale = 1;');
    expect(
      screen.getByTestId('oxford-word-list-webview').props
        .injectedJavaScriptBeforeContentLoaded,
    ).not.toContain('viewport');
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

  it('refreshes the alphabet after native list changes and navigation', async () => {
    const screen = await render(<App />);
    const view = screen.getByTestId('oxford-word-list-webview');
    expect(screen.getByRole('button', { name: 'B' })).toBeDisabled();
    await fireFilterMessage(view, { type: 'WORD_LIST_STATE', letters: ['B'] });
    expect(screen.getByRole('button', { name: 'B' })).not.toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'B' }));
    expect(mockInjectJavaScript).toHaveBeenCalledWith(expect.stringContaining("var requestedLetter = 'B';"));
    await fireFilterMessage(view, { type: 'WORD_LIST_STATE', letters: ['X'] });
    expect(screen.getByRole('button', { name: 'B' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'X' })).not.toBeDisabled();
    await fireEvent(view, 'loadStart');
    expect(screen.getByRole('button', { name: 'X' })).toBeDisabled();
    await fireFilterMessage(view, { type: 'WORD_LIST_STATE', letters: ['A'] });
    expect(screen.getByRole('button', { name: 'A' })).not.toBeDisabled();
  });
  it('opens only bridged word entries in the right pane', async () => {
    const screen = await render(<App />);
    const url = 'https://www.oxfordlearnersdictionaries.com/definition/english/apple';
    await fireFilterMessage(screen.getByTestId('oxford-word-list-webview'), { type: 'WORD_LIST_ENTRY', url });
    expect(screen.getByTestId('dictionary-webview').props.source).toEqual({ uri: url });
  });
});
