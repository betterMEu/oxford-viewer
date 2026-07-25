import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import {
  WebView,
  type WebViewMessageEvent,
} from 'react-native-webview';

import type { Word } from '../types/word';

type DictionaryWebViewProps = {
  word: Word;
};

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

const UK_PRONUNCIATION_SELECTOR =
  '#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_br > .audio_play_button.pron-uk';
const US_PRONUNCIATION_SELECTOR =
  '#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_n_am > .audio_play_button.pron-us';

function createPronunciationTestScript(selector: string) {
  return `
    (function () {
      var element = document.querySelector(${JSON.stringify(selector)});
      if (element) {
        window.ReactNativeWebView.postMessage('FOUND');
        element.click();
      } else {
        window.ReactNativeWebView.postMessage('NOT_FOUND');
      }
    })();
    true;
  `;
}

export function DictionaryWebView({ word }: DictionaryWebViewProps) {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const webViewRef = useRef<WebView>(null);

  const injectPronunciationClick = (selector: string) => {
    webViewRef.current?.injectJavaScript(
      createPronunciationTestScript(selector),
    );
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    console.log('Oxford audio test:', event.nativeEvent.data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.testControls}>
        <Button
          title="UK Test"
          onPress={() =>
            injectPronunciationClick(UK_PRONUNCIATION_SELECTOR)
          }
        />
        <Button
          title="US Test"
          onPress={() =>
            injectPronunciationClick(US_PRONUNCIATION_SELECTOR)
          }
        />
      </View>
      <WebView
        ref={webViewRef}
        accessibilityLabel={`Oxford dictionary page for ${word.word}`}
        onError={() => setLoadState('error')}
        onLoadEnd={() =>
          setLoadState((currentState) =>
            currentState === 'error' ? 'error' : 'loaded',
          )
        }
        onLoadStart={() => setLoadState('loading')}
        onMessage={handleMessage}
        source={{ uri: word.oxfordUrl }}
        style={styles.webView}
        testID="dictionary-webview"
      />
      {loadState === 'loading' && (
        <View pointerEvents="none" style={styles.statusOverlay}>
          <Text style={styles.statusText}>Loading Oxford page…</Text>
        </View>
      )}
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
  testControls: {
    borderBottomColor: '#cbd5e1',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 4,
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
