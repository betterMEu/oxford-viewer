import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CORE_WORD_LISTS,
  type CoreWordListId,
} from '../word-lists/coreWordLists';

type CoreWordListSelectorProps = {
  value: CoreWordListId;
  disabled: boolean;
  onChange: (value: CoreWordListId) => void;
};

export function CoreWordListSelector({
  value,
  disabled,
  onChange,
}: CoreWordListSelectorProps) {
  return (
    <View style={styles.container}>
      {CORE_WORD_LISTS.map((option) => {
        const selected = option.id === value;

        return (
          <Pressable
            key={option.id}
            accessibilityLabel={option.accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected }}
            disabled={disabled}
            onPress={() => {
              if (!disabled && !selected) {
                onChange(option.id);
              }
            }}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selectedOption,
              pressed && !disabled && styles.pressedOption,
              disabled && styles.disabledOption,
            ]}
          >
            <Text
              adjustsFontSizeToFit
              numberOfLines={2}
              style={[
                styles.optionText,
                selected && styles.selectedOptionText,
              ]}
            >
              {option.shortLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderBottomColor: '#cbd5e1',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    padding: 4,
    width: '100%',
  },
  option: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  selectedOption: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  pressedOption: {
    backgroundColor: '#e2e8f0',
  },
  disabledOption: {
    opacity: 0.45,
  },
  optionText: {
    color: '#334155',
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
});
