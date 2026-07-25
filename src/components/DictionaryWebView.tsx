import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import type { Word } from '../types/word';

type DictionaryWebViewProps = {
  word: Word;
};

export function DictionaryWebView({ word }: DictionaryWebViewProps) {
  return (
    <View style={styles.container}>
      <WebView
        accessibilityLabel={`Oxford dictionary page for ${word.word}`}
        source={{ uri: word.oxfordUrl }}
        style={styles.webView}
        testID="dictionary-webview"
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
