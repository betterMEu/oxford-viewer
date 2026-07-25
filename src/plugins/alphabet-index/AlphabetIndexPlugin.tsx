import { Pressable, StyleSheet, Text, View } from 'react-native';

export const ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export type AlphabetLetter = (typeof ALPHABET)[number];

type AlphabetIndexPluginProps = {
  bottomInset?: number;
  disabled: boolean;
  onSelectLetter: (letter: AlphabetLetter) => void;
  topInset?: number;
};

export function AlphabetIndexPlugin({
  bottomInset = 0,
  disabled,
  onSelectLetter,
  topInset = 0,
}: AlphabetIndexPluginProps) {
  return (
    <View
      accessibilityLabel="Alphabet index"
      style={[
        styles.container,
        {
          paddingBottom: bottomInset + 2,
          paddingTop: topInset + 2,
        },
      ]}
    >
      {ALPHABET.map((letter) => {
        const letterDisabled = disabled || letter === 'X';

        return (
          <Pressable
            key={letter}
            accessibilityLabel={letter}
            accessibilityRole="button"
            accessibilityState={{ disabled: letterDisabled }}
            disabled={letterDisabled}
            onPress={() => onSelectLetter(letter)}
            style={({ pressed }) => [
              styles.letterButton,
              pressed && !letterDisabled && styles.pressedButton,
              letterDisabled && styles.disabledButton,
            ]}
          >
            <Text style={styles.letterText}>{letter}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderLeftColor: '#cbd5e1',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#cbd5e1',
    borderRightWidth: StyleSheet.hairlineWidth,
    width: 28,
  },
  letterButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 0,
  },
  pressedButton: {
    backgroundColor: '#dbeafe',
  },
  disabledButton: {
    opacity: 0.35,
  },
  letterText: {
    color: '#1d4ed8',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 10,
    textAlign: 'center',
  },
});
