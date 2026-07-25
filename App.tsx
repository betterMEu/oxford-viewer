import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { DictionaryWebView } from './src/components/DictionaryWebView';
import { OxfordWordListWebView } from './src/components/OxfordWordListWebView';
import type { WordListWebMessage } from './src/word-lists/buildWordListFilterScript';
import { DEFAULT_CORE_WORD_LIST } from './src/word-lists/coreWordLists';

const INITIAL_DEFINITION_URL =
  'https://www.oxfordlearnersdictionaries.com/definition/english/a_1';

export default function App() {
  const [selectedDefinitionUrl, setSelectedDefinitionUrl] = useState(
    INITIAL_DEFINITION_URL,
  );
  const [filterError, setFilterError] = useState(false);

  const handleFilterResult = (result: WordListWebMessage) => {
    if (result.wordListId !== DEFAULT_CORE_WORD_LIST) {
      return;
    }

    setFilterError(result.type === 'WORD_LIST_FILTER_FAILED');
  };

  return (
    <SafeAreaProvider style={styles.provider}>
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safeArea}
      >
        <StatusBar style="dark" />
        <View style={styles.splitPane}>
          <View style={styles.wordPane}>
            {filterError && (
              <Text accessibilityRole="alert" style={styles.filterError}>
                无法显示 Oxford 3000，Oxford 页面结构可能已变化。
              </Text>
            )}
            <OxfordWordListWebView
              onDefinitionSelected={setSelectedDefinitionUrl}
              onFilterResult={handleFilterResult}
              selectedList={DEFAULT_CORE_WORD_LIST}
            />
          </View>
          <View style={styles.dictionaryPane}>
            <DictionaryWebView url={selectedDefinitionUrl} />
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
