import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  buildDefinitionAutoScrollScript,
} from '../plugins/definition-auto-scroll/buildDefinitionAutoScrollScript';
import {
  buildPaneWidthFitScript,
} from '../plugins/pane-width-fit/buildPaneWidthFitScript';

type DictionaryWebViewProps = {
  fitToWidth?: boolean;
  url: string;
};

type LoadState = 'idle' | 'error';

export function DictionaryWebView({
  fitToWidth = false,
  url,
}: DictionaryWebViewProps) {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const webViewRef = useRef<WebView>(null);
  const hasErrorRef = useRef(false);
  const isLoadedRef = useRef(false);
  const definitionAutoScrollScript =
    buildDefinitionAutoScrollScript();
  const paneWidthFitScript =
    buildPaneWidthFitScript(fitToWidth);
  const beforeContentLoadedScript =
    `${paneWidthFitScript}\n${definitionAutoScrollScript}`;

  useEffect(() => {
    if (isLoadedRef.current) {
      webViewRef.current?.injectJavaScript(paneWidthFitScript);
    }
  }, [paneWidthFitScript]);

  const handleLoadStart = () => {
    hasErrorRef.current = false;
    isLoadedRef.current = false;
    setLoadState('idle');
  };

  const handleError = () => {
    hasErrorRef.current = true;
    isLoadedRef.current = false;
    setLoadState('error');
  };

  const handleLoadEnd = () => {
    if (!hasErrorRef.current) {
      isLoadedRef.current = true;
      webViewRef.current?.injectJavaScript(
        beforeContentLoadedScript,
      );
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        accessibilityLabel="Oxford dictionary definition page"
        injectedJavaScriptBeforeContentLoaded={
          beforeContentLoadedScript
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
    ...StyleSheet.absoluteFillObject,
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
