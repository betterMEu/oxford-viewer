import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { OXFORD_WORD_LIST_URL } from '../word-lists/coreWordLists';
import { OxfordWordListWebView } from './OxfordWordListWebView';

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

const createProps = () => ({
  onLoadStateChange: jest.fn(),
  onDefinitionSelected: jest.fn(),
  onFilterResult: jest.fn(),
});

describe('OxfordWordListWebView', () => {
  beforeEach(() => {
    mockInjectJavaScript.mockClear();
  });

  it('loads the official Oxford word list URL', async () => {
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...createProps()} />,
    );

    expect(screen.getByTestId('oxford-word-list-webview')).toHaveProp(
      'source',
      { uri: OXFORD_WORD_LIST_URL },
    );
  });

  it('injects the current mode after the page finishes loading', async () => {
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...createProps()} />,
    );

    await fireEvent(
      screen.getByTestId('oxford-word-list-webview'),
      'loadEnd',
    );

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      "var wordListId = 'ox3000';",
    );
  });

  it('injects a new mode without reloading an already loaded page', async () => {
    const props = createProps();
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...props} />,
    );
    const webView = screen.getByTestId('oxford-word-list-webview');
    await fireEvent(webView, 'loadEnd');
    mockInjectJavaScript.mockClear();

    await screen.rerender(
      <OxfordWordListWebView selectedList="ox5000" {...props} />,
    );

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      "var wordListId = 'ox5000';",
    );
  });

  it('keeps only the latest selection while a page is loading', async () => {
    const props = createProps();
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...props} />,
    );
    const webView = screen.getByTestId('oxford-word-list-webview');

    await fireEvent(webView, 'loadStart');
    await screen.rerender(
      <OxfordWordListWebView selectedList="ox5000" {...props} />,
    );
    await screen.rerender(
      <OxfordWordListWebView selectedList="ox5000Diff" {...props} />,
    );
    expect(mockInjectJavaScript).not.toHaveBeenCalled();

    await fireEvent(
      screen.getByTestId('oxford-word-list-webview'),
      'loadEnd',
    );

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      "var wordListId = 'ox5000Diff';",
    );
  });

  it('keeps the initial word list navigation in the left WebView', async () => {
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...createProps()} />,
    );
    const handleRequest = screen.getByTestId('oxford-word-list-webview')
      .props.onShouldStartLoadWithRequest;

    expect(
      handleRequest({
        url: OXFORD_WORD_LIST_URL,
        isTopFrame: true,
      }),
    ).toBe(true);
  });

  it('intercepts top-level Oxford definition links for the right pane', async () => {
    const props = createProps();
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...props} />,
    );
    const handleRequest = screen.getByTestId('oxford-word-list-webview')
      .props.onShouldStartLoadWithRequest;
    const definitionUrl =
      'https://www.oxfordlearnersdictionaries.com/definition/english/abandon_1';

    expect(
      handleRequest({
        url: definitionUrl,
        isTopFrame: true,
      }),
    ).toBe(false);
    expect(props.onDefinitionSelected).toHaveBeenCalledWith(definitionUrl);
  });

  it('allows non-top-level audio and resource requests', async () => {
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...createProps()} />,
    );
    const handleRequest = screen.getByTestId('oxford-word-list-webview')
      .props.onShouldStartLoadWithRequest;

    expect(
      handleRequest({
        url: 'https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/a/a__/a__gb/a__gb_2.mp3',
        isTopFrame: false,
      }),
    ).toBe(true);
  });

  it('blocks other top-level navigation from replacing the word list', async () => {
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...createProps()} />,
    );
    const handleRequest = screen.getByTestId('oxford-word-list-webview')
      .props.onShouldStartLoadWithRequest;

    expect(
      handleRequest({
        url: 'https://www.oxfordlearnersdictionaries.com/about/',
        isTopFrame: true,
      }),
    ).toBe(false);
  });

  it('keeps the error state when load end follows an error', async () => {
    const props = createProps();
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...props} />,
    );
    const webView = screen.getByTestId('oxford-word-list-webview');

    await fireEvent(webView, 'loadStart');
    await fireEvent(webView, 'error');
    await fireEvent(webView, 'loadEnd');

    expect(props.onLoadStateChange.mock.calls).toEqual([
      ['loading'],
      ['error'],
    ]);
    expect(mockInjectJavaScript).not.toHaveBeenCalled();
  });

  it('passes valid filter messages to the app', async () => {
    const props = createProps();
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...props} />,
    );
    const message = {
      type: 'WORD_LIST_FILTER_APPLIED',
      wordListId: 'ox3000',
    };

    await fireEvent(
      screen.getByTestId('oxford-word-list-webview'),
      'message',
      {
        nativeEvent: { data: JSON.stringify(message) },
      },
    );

    expect(props.onFilterResult).toHaveBeenCalledWith(message);
  });

  it('ignores non-JSON and unknown WebView messages', async () => {
    const props = createProps();
    const screen = await render(
      <OxfordWordListWebView selectedList="ox3000" {...props} />,
    );
    const webView = screen.getByTestId('oxford-word-list-webview');

    await fireEvent(webView, 'message', {
      nativeEvent: { data: 'not json' },
    });
    await fireEvent(webView, 'message', {
      nativeEvent: {
        data: JSON.stringify({ type: 'SOMETHING_ELSE' }),
      },
    });

    expect(props.onFilterResult).not.toHaveBeenCalled();
  });
});
