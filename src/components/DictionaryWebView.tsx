import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { PRONUNCIATION_SCRIPT } from '../plugins/pronunciation/buildPronunciationScript';

import {
  buildDefinitionAutoScrollScript,
} from '../plugins/definition-auto-scroll/buildDefinitionAutoScrollScript';
import {
  buildDefinitionPageScaleScript,
} from '../plugins/definition-page-scale/buildDefinitionPageScaleScript';

type DictionaryWebViewProps = {
  paneWidth: number;
  shrinkToFit: boolean;
  topInset: number;
  url: string;
};

type LoadState = 'idle' | 'error';

export function DictionaryWebView({
  paneWidth,
  shrinkToFit,
  topInset,
  url,
}: DictionaryWebViewProps) {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const webViewRef = useRef<WebView>(null);
  const hasErrorRef = useRef(false);
  const pageLoadedRef = useRef(false);
  const definitionPageScript = useMemo(
    () =>
      [
        buildDefinitionPageScaleScript(
          paneWidth,
          shrinkToFit,
        ),
        buildDefinitionAutoScrollScript(topInset),
      ].join('\n'),
    [paneWidth, shrinkToFit, topInset],
  );

  useEffect(() => {
    if (pageLoadedRef.current && !hasErrorRef.current) {
      webViewRef.current?.injectJavaScript(
        definitionPageScript,
      );
    }
  }, [definitionPageScript]);

  const handleLoadStart = () => {
    hasErrorRef.current = false;
    pageLoadedRef.current = false;
    setLoadState('idle');
  };

  const handleError = () => {
    hasErrorRef.current = true;
    pageLoadedRef.current = false;
    setLoadState('error');
  };

  const handleLoadEnd = () => {
    if (!hasErrorRef.current) {
      pageLoadedRef.current = true;
      webViewRef.current?.injectJavaScript(
        definitionPageScript,
      );
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        accessibilityLabel="Oxford dictionary definition page"
        injectedJavaScriptBeforeContentLoaded={
          PRONUNCIATION_SCRIPT + definitionPageScript
        }
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        onLoadStart={handleLoadStart}
        source={{ uri: url }}
        style={styles.webView}
        testID="dictionary-webview"
      />
      {loadState === 'error' && (
        <View
          accessibilityRole="alert"
          pointerEvents="none"
          style={styles.statusOverlay}
        >
          <Text style={[styles.statusText, styles.errorText]}>
            Unable to load Oxford page.
          </Text>
        </View>
      )}
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
  statusOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    justifyContent: 'center',
    padding: 16,
  },
  statusText: {
    color: '#334155',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#9f1239',
  },
});
