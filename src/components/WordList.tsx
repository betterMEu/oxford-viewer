import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { Word } from '../types/word';
import { WordRow } from './WordRow';

type WordListProps = {
  words: Word[];
  selectedWord: Word;
  onSelectWord: (word: Word) => void;
};

export function WordList({
  words,
  selectedWord,
  onSelectWord,
}: WordListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Words</Text>
      <FlatList
        data={words}
        extraData={selectedWord.word}
        keyExtractor={(item) => item.word}
        renderItem={({ item }) => (
          <WordRow
            word={item}
            isSelected={item.word === selectedWord.word}
            onSelect={onSelectWord}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f9fb',
    flex: 1,
  },
  heading: {
    borderBottomColor: '#c9d1d9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: '#1b2733',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
});
