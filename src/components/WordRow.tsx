import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Word } from '../types/word';

type WordRowProps = {
  word: Word;
  isSelected: boolean;
  onSelect: (word: Word) => void;
};

const doNothing = () => undefined;

export function WordRow({ word, isSelected, onSelect }: WordRowProps) {
  return (
    <View style={[styles.row, isSelected && styles.selectedRow]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onSelect(word)}
        style={styles.wordButton}
      >
        <Text numberOfLines={1} style={styles.word}>
          {word.word}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={`UK pronunciation placeholder for ${word.word}`}
        accessibilityRole="button"
        onPress={doNothing}
        style={styles.accentButton}
      >
        <Text style={styles.accentButtonText}>UK</Text>
      </Pressable>
      <Pressable
        accessibilityLabel={`US pronunciation placeholder for ${word.word}`}
        accessibilityRole="button"
        onPress={doNothing}
        style={styles.accentButton}
      >
        <Text style={styles.accentButtonText}>US</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: '#d8dde3',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    minHeight: 56,
    paddingHorizontal: 8,
  },
  selectedRow: {
    backgroundColor: '#e7f0fa',
  },
  wordButton: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  word: {
    color: '#1b2733',
    fontSize: 16,
    fontWeight: '600',
  },
  accentButton: {
    alignItems: 'center',
    backgroundColor: '#0b5cab',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
  },
  accentButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
