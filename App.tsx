import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { DictionaryWebView } from './src/components/DictionaryWebView';
import { WordList } from './src/components/WordList';
import { WORDS } from './src/data/words';
import type { Word } from './src/types/word';

export default function App() {
  const [selectedWord, setSelectedWord] = useState<Word>(WORDS[0]);

  return (
    <SafeAreaProvider style={styles.provider}>
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.splitPane}>
          <View style={styles.wordPane}>
            <WordList
              words={WORDS}
              selectedWord={selectedWord}
              onSelectWord={setSelectedWord}
            />
          </View>
          <View style={styles.dictionaryPane}>
            <DictionaryWebView word={selectedWord} />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  splitPane: {
    flex: 1,
    flexDirection: 'row',
  },
  wordPane: {
    borderRightColor: '#c9d1d9',
    borderRightWidth: StyleSheet.hairlineWidth,
    flex: 2,
  },
  dictionaryPane: {
    flex: 3,
  },
});
