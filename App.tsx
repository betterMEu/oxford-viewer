import { useRef, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { DictionaryWebView } from './src/components/DictionaryWebView';
import {
  OxfordWordListWebView,
  type OxfordWordListWebViewHandle,
} from './src/components/OxfordWordListWebView';
import {
  AlphabetIndexPlugin,
  type AlphabetLetter,
} from './src/plugins/alphabet-index/AlphabetIndexPlugin';
import type { WordListState } from './src/word-lists/buildWordListBridgeScript';

const INITIAL_DEFINITION_URL =
  'https://www.oxfordlearnersdictionaries.com/definition/english/a_1';
const ALPHABET_INDEX_WIDTH = 28;
const DICTIONARY_PANE_FLEX = 3;
const TOTAL_CONTENT_FLEX = 5;

export default function App() {
  return (
    <SafeAreaProvider style={styles.provider}>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { height, width } = useWindowDimensions();
  const { bottom, left, right, top } = useSafeAreaInsets();
  const wordListWebViewRef = useRef<OxfordWordListWebViewHandle>(null);
  const [selectedDefinitionUrl, setSelectedDefinitionUrl] = useState(
    INITIAL_DEFINITION_URL,
  );
  const [letters, setLetters] = useState<string[]>([]);
  const [wordListReady, setWordListReady] = useState(false);
  const splitPaneWidth = Math.max(
    0,
    width - left - right - ALPHABET_INDEX_WIDTH,
  );
  const dictionaryPaneWidth =
    (splitPaneWidth * DICTIONARY_PANE_FLEX) /
    TOTAL_CONTENT_FLEX;
  const isPortrait = height >= width;

  const handleListState = (result: WordListState) => {
    setLetters(result.letters);
    setWordListReady(result.letters.length > 0);
  };

  const handleWordListLoadStateChange = (
    state: 'idle' | 'loading' | 'loaded' | 'error',
  ) => {
    if (state === 'loading' || state === 'error') {
      setWordListReady(false);
    }
  };

  const handleLetterSelected = (letter: AlphabetLetter) => {
    wordListWebViewRef.current?.scrollToLetter(letter);
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={styles.safeArea}
      testID="app-safe-area"
    >
      <StatusBar hidden style="dark" />
      <View style={styles.splitPane}>
        <View style={styles.wordPane}>
          <OxfordWordListWebView
            ref={wordListWebViewRef}
            onDefinitionSelected={setSelectedDefinitionUrl}
            onListState={handleListState}
            onLoadStateChange={handleWordListLoadStateChange}
          />
        </View>
        <AlphabetIndexPlugin
          bottomInset={bottom}
          disabled={!wordListReady}
          availableLetters={letters}
          onSelectLetter={handleLetterSelected}
          topInset={top}
        />
        <View style={styles.dictionaryPane}>
          <DictionaryWebView
            paneWidth={dictionaryPaneWidth}
            shrinkToFit={isPortrait}
            topInset={top}
            url={selectedDefinitionUrl}
          />
        </View>
      </View>
    </SafeAreaView>
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
