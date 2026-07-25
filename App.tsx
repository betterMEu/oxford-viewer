import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { CoreWordListSelector } from './src/components/CoreWordListSelector';
import { DictionaryWebView } from './src/components/DictionaryWebView';
import { OxfordWordListWebView } from './src/components/OxfordWordListWebView';
import type { WordListWebMessage } from './src/word-lists/buildWordListFilterScript';
import {
  DEFAULT_CORE_WORD_LIST,
  type CoreWordListId,
} from './src/word-lists/coreWordLists';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

const INITIAL_DEFINITION_URL =
  'https://www.oxfordlearnersdictionaries.com/definition/english/a_1';

export default function App() {
  const [requestedList, setRequestedList] = useState<CoreWordListId>(
    DEFAULT_CORE_WORD_LIST,
  );
  const [appliedList, setAppliedList] = useState<CoreWordListId>(
    DEFAULT_CORE_WORD_LIST,
  );
  const [selectedDefinitionUrl, setSelectedDefinitionUrl] = useState(
    INITIAL_DEFINITION_URL,
  );
  const [wordListLoadState, setWordListLoadState] =
    useState<LoadState>('idle');
  const [filterError, setFilterError] = useState(false);

  const handleListChange = (wordListId: CoreWordListId) => {
    setFilterError(false);
    setRequestedList(wordListId);
  };

  const handleFilterResult = (result: WordListWebMessage) => {
    if (result.wordListId !== requestedList) {
      return;
    }

    if (result.type === 'WORD_LIST_FILTER_APPLIED') {
      setAppliedList(result.wordListId);
      setFilterError(false);
      return;
    }

    setRequestedList(appliedList);
    setFilterError(true);
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
            <CoreWordListSelector
              disabled={wordListLoadState !== 'loaded'}
              onChange={handleListChange}
              value={appliedList}
            />
            {filterError && (
              <Text accessibilityRole="alert" style={styles.filterError}>
                无法切换词库，Oxford 页面结构可能已变化。
              </Text>
            )}
            <OxfordWordListWebView
              onDefinitionSelected={setSelectedDefinitionUrl}
              onFilterResult={handleFilterResult}
              onLoadStateChange={setWordListLoadState}
              selectedList={requestedList}
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
