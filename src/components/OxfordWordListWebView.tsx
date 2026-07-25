import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewProps,
} from 'react-native-webview';

import {
  buildWordListFilterScript,
  type WordListWebMessage,
} from '../word-lists/buildWordListFilterScript';
import {
  CORE_WORD_LISTS,
  OXFORD_WORD_LIST_URL,
  type CoreWordListId,
} from '../word-lists/coreWordLists';

type WordListLoadState = 'idle' | 'loading' | 'loaded' | 'error';
type ShouldStartLoadRequest = Parameters<
  NonNullable<WebViewProps['onShouldStartLoadWithRequest']>
>[0];

type OxfordWordListWebViewProps = {
  selectedList: CoreWordListId;
  onLoadStateChange?: (state: WordListLoadState) => void;
  onDefinitionSelected: (url: string) => void;
  onFilterResult: (result: WordListWebMessage) => void;
};

const OXFORD_DEFINITION_URL_PREFIX =
  'https://www.oxfordlearnersdictionaries.com/definition/english/';

function isCoreWordListId(value: unknown): value is CoreWordListId {
  return CORE_WORD_LISTS.some(({ id }) => id === value);
}

function parseWordListMessage(data: string): WordListWebMessage | null {
  try {
    const parsed: unknown = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const message = parsed as Record<string, unknown>;
    if (!isCoreWordListId(message.wordListId)) {
      return null;
    }

    if (message.type === 'WORD_LIST_FILTER_APPLIED') {
      return {
        type: 'WORD_LIST_FILTER_APPLIED',
        wordListId: message.wordListId,
      };
    }

    if (
      message.type === 'WORD_LIST_FILTER_FAILED' &&
      message.reason === 'WORD_LIST_DOM_NOT_FOUND'
    ) {
      return {
        type: 'WORD_LIST_FILTER_FAILED',
        wordListId: message.wordListId,
        reason: 'WORD_LIST_DOM_NOT_FOUND',
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function OxfordWordListWebView({
  selectedList,
  onLoadStateChange,
  onDefinitionSelected,
  onFilterResult,
}: OxfordWordListWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const isLoadedRef = useRef(false);
  const hasErrorRef = useRef(false);
  const latestListRef = useRef(selectedList);

  latestListRef.current = selectedList;

  const injectFilter = (wordListId: CoreWordListId) => {
    webViewRef.current?.injectJavaScript(
      buildWordListFilterScript(wordListId),
    );
  };

  useEffect(() => {
    if (isLoadedRef.current) {
      injectFilter(selectedList);
    }
  }, [selectedList]);

  const handleNavigation = (request: ShouldStartLoadRequest) => {
    if (!request.isTopFrame) {
      return true;
    }

    if (request.url === OXFORD_WORD_LIST_URL) {
      return true;
    }

    if (request.url.startsWith(OXFORD_DEFINITION_URL_PREFIX)) {
      onDefinitionSelected(request.url);
    }

    return false;
  };

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
    injectFilter(latestListRef.current);
  };

  const handleError = () => {
    hasErrorRef.current = true;
    isLoadedRef.current = false;
    onLoadStateChange?.('error');
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const result = parseWordListMessage(event.nativeEvent.data);
    if (result) {
      onFilterResult(result);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        accessibilityLabel="Oxford core word list"
        allowsInlineMediaPlayback
        domStorageEnabled
        javaScriptEnabled
        mediaPlaybackRequiresUserAction
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        onLoadStart={handleLoadStart}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleNavigation}
        sharedCookiesEnabled
        source={{ uri: OXFORD_WORD_LIST_URL }}
        style={styles.webView}
        testID="oxford-word-list-webview"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});
