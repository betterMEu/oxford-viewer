import { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
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
import type { WordListWebMessage } from './src/word-lists/buildWordListFilterScript';
import { DEFAULT_CORE_WORD_LIST } from './src/word-lists/coreWordLists';

const INITIAL_DEFINITION_URL =
  'https://www.oxfordlearnersdictionaries.com/definition/english/a_1';

export default function App() {
  return (
    <SafeAreaProvider style={styles.provider}>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { bottom, top } = useSafeAreaInsets();
  const wordListWebViewRef = useRef<OxfordWordListWebViewHandle>(null);
  const [selectedDefinitionUrl, setSelectedDefinitionUrl] = useState(
    INITIAL_DEFINITION_URL,
  );
  const [filterError, setFilterError] = useState(false);
  const [wordListReady, setWordListReady] = useState(false);

  const handleFilterResult = (result: WordListWebMessage) => {
    if (result.wordListId !== DEFAULT_CORE_WORD_LIST) {
      return;
    }

    const failed = result.type === 'WORD_LIST_FILTER_FAILED';
    setFilterError(failed);
    setWordListReady(!failed);
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
          {filterError && (
            <Text accessibilityRole="alert" style={styles.filterError}>
              无法显示 Oxford 3000，Oxford 页面结构可能已变化。
            </Text>
          )}
          <OxfordWordListWebView
            ref={wordListWebViewRef}
            onDefinitionSelected={setSelectedDefinitionUrl}
            onFilterResult={handleFilterResult}
            onLoadStateChange={handleWordListLoadStateChange}
            selectedList={DEFAULT_CORE_WORD_LIST}
          />
        </View>
        <AlphabetIndexPlugin
          bottomInset={bottom}
          disabled={!wordListReady}
          onSelectLetter={handleLetterSelected}
          topInset={top}
        />
        <View style={styles.dictionaryPane}>
          <DictionaryWebView url={selectedDefinitionUrl} />
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
  filterError: {
    backgroundColor: '#fff7ed',
    color: '#9a3412',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dictionaryPane: {
    flex: 3,
  },
});
