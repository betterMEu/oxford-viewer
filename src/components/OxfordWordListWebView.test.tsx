import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { OXFORD_WORD_LIST_URL } from '../word-lists/coreWordLists';
import {
  OxfordWordListWebView,
  type OxfordWordListWebViewHandle,
} from './OxfordWordListWebView';

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

const createProps = () => ({ onLoadStateChange: jest.fn(), onDefinitionSelected: jest.fn(), onListState: jest.fn() });
describe('OxfordWordListWebView', () => {
  beforeEach(() => { mockInjectJavaScript.mockClear(); });
  it('keeps native navigation and installs the bridge after reload', async () => {
    const props = createProps();
    const screen = await render(<OxfordWordListWebView {...props} />);
    const view = screen.getByTestId('oxford-word-list-webview');
    expect(view.props.source).toEqual({ uri: OXFORD_WORD_LIST_URL });
    expect(view.props.onShouldStartLoadWithRequest).toBeUndefined();
    await fireEvent(view, 'loadStart');
    await fireEvent(view, 'loadEnd');
    expect(mockInjectJavaScript).toHaveBeenCalledWith(expect.stringContaining('__oxfordWordListBridge'));
    await fireEvent(view, 'message', { nativeEvent: { data: JSON.stringify({ type: 'WORD_LIST_ENTRY', url: 'https://www.oxfordlearnersdictionaries.com/definition/english/apple' }) } });
    expect(props.onDefinitionSelected).toHaveBeenCalledTimes(1);
    await fireEvent(view, 'message', { nativeEvent: { data: JSON.stringify({ type: 'WORD_LIST_ENTRY', url: 'https://example.com/' }) } });
    expect(props.onDefinitionSelected).toHaveBeenCalledTimes(1);
  });
  it('updates readiness from the current list and clears it during navigation', async () => {
    const props = createProps();
    const ref = createRef<OxfordWordListWebViewHandle>();
    const screen = await render(<OxfordWordListWebView ref={ref} {...props} />);
    const view = screen.getByTestId('oxford-word-list-webview');
    await fireEvent(view, 'message', { nativeEvent: { data: JSON.stringify({ type: 'WORD_LIST_STATE', letters: ['B'] }) } });
    expect(props.onListState).toHaveBeenCalledWith({ type: 'WORD_LIST_STATE', letters: ['B'] });
    ref.current?.scrollToLetter('B');
    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    await fireEvent(view, 'loadStart');
    ref.current?.scrollToLetter('B');
    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
  });
});
