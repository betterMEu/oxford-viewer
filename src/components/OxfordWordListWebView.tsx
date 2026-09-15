import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { PRONUNCIATION_SCRIPT } from '../plugins/pronunciation/buildPronunciationScript';
import {
  WebView,
  type WebViewMessageEvent,
} from 'react-native-webview';

import { buildWordListBridgeScript, type WordListState } from '../word-lists/buildWordListBridgeScript';
import { buildAlphabetScrollScript } from '../plugins/alphabet-index/buildAlphabetScrollScript';
import type { AlphabetLetter } from '../plugins/alphabet-index/AlphabetIndexPlugin';
import { OXFORD_WORD_LIST_URL } from '../word-lists/coreWordLists';

type OxfordWordListWebViewProps = {
  onLoadStateChange?: (state: 'loading' | 'loaded' | 'error') => void;
  onDefinitionSelected: (url: string) => void;
  onListState: (state: WordListState) => void;
};

export type OxfordWordListWebViewHandle = {
  scrollToLetter: (letter: AlphabetLetter) => void;
};

const OXFORD_DEFINITION_URL_PREFIX =
  'https://www.oxfordlearnersdictionaries.com/definition/english/';

export const OxfordWordListWebView = forwardRef<
  OxfordWordListWebViewHandle,
  OxfordWordListWebViewProps
>(function OxfordWordListWebView(
  {
    onLoadStateChange,
    onDefinitionSelected,
    onListState,
  },
  ref,
) {
  const webViewRef = useRef<WebView>(null);
  const isLoadedRef = useRef(false);
  const hasErrorRef = useRef(false);
  useImperativeHandle(ref, () => ({
    scrollToLetter: (letter) => {
      if (isLoadedRef.current) {
        webViewRef.current?.injectJavaScript(
          buildAlphabetScrollScript(letter, true),
        );
      }
    },
  }));

  const handleLoadStart = () => {
    isLoadedRef.current = false;
    hasErrorRef.current = false;
    onLoadStateChange?.('loading');
  };

  const handleLoadEnd = () => {
    if (hasErrorRef.current) {
      return;
    }

    isLoadedRef.current = true;
    onLoadStateChange?.('loaded');
    webViewRef.current?.injectJavaScript(buildWordListBridgeScript());
  };

  const handleError = () => {
    hasErrorRef.current = true;
    isLoadedRef.current = false;
    onLoadStateChange?.('error');
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const result = JSON.parse(event.nativeEvent.data);
      if (result.type === 'WORD_LIST_ENTRY' && typeof result.url === 'string' &&
          result.url.startsWith(OXFORD_DEFINITION_URL_PREFIX)) {
        onDefinitionSelected(result.url);
      } else if (result.type === 'WORD_LIST_STATE' && Array.isArray(result.letters) &&
          result.letters.every((letter: unknown) => typeof letter === 'string' && /^[A-Z]$/.test(letter))) {
        isLoadedRef.current = result.letters.length > 0;
        onListState(result);
      }
    } catch { /* Ignore unrelated page messages. */ }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        accessibilityLabel="Oxford core word list"
        allowsInlineMediaPlayback
        domStorageEnabled
        javaScriptEnabled
        injectedJavaScriptBeforeContentLoaded={
          PRONUNCIATION_SCRIPT + buildWordListBridgeScript()
        }
        mediaPlaybackRequiresUserAction
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        onLoadStart={handleLoadStart}
        onMessage={handleMessage}
        setSupportMultipleWindows={false}
        sharedCookiesEnabled
        source={{ uri: OXFORD_WORD_LIST_URL }}
        style={styles.webView}
        testID="oxford-word-list-webview"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});
