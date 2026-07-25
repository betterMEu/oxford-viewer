import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

type DictionaryWebViewProps = {
  url: string;
};

type LoadState = 'idle' | 'error';

export function DictionaryWebView({ url }: DictionaryWebViewProps) {
  const [loadState, setLoadState] = useState<LoadState>('idle');

  return (
    <View style={styles.container}>
      <WebView
        accessibilityLabel="Oxford dictionary definition page"
        onError={() => setLoadState('error')}
        onLoadStart={() => setLoadState('idle')}
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
