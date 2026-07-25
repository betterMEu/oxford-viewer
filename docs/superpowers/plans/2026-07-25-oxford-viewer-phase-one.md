# Oxford Viewer Phase One Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first-phase Expo iPhone client with a five-word list and an Oxford Learner's Dictionaries WebView.

**Architecture:** A single `App.tsx` owns the selected `Word` and composes a 40/60 horizontal split. Focused components render the list, rows, and WebView; immutable data contains only `word` and `oxfordUrl`.

**Tech Stack:** Expo, React Native, TypeScript, `react-native-webview`, Jest, React Native Testing Library

## Global Constraints

- The app is for personal iPhone use through Expo Go.
- Word data contains exactly `word` and `oxfordUrl`.
- Do not store Oxford definitions, audio, or scraped page content.
- UK and US buttons remain clickable no-ops.
- Do not add pronunciation, selector guesses, search, favorites, a database, system TTS, or unrelated features.
- WebView must not inject JavaScript or inspect the Oxford DOM.

---

### Task 1: Scaffold the Expo project and word data

**Files:**
- Create: Expo-generated root configuration and assets
- Modify: `package.json`
- Create: `src/types/word.ts`
- Create: `src/data/words.ts`
- Create: `src/data/words.test.ts`
- Create: `src/services/.gitkeep`

**Interfaces:**
- Produces: `Word` with `word: string` and `oxfordUrl: string`
- Produces: `WORDS: Word[]` containing exactly five entries

- [ ] **Step 1: Generate the Expo TypeScript scaffold**

Run `npx create-expo-app@latest work/expo-scaffold --template blank-typescript`, copy the generated root files and `assets/` into the repository without overwriting `docs/`, then remove the temporary scaffold.

- [ ] **Step 2: Install runtime and test dependencies**

Run:

```powershell
npx expo install react-native-webview
npx expo install jest-expo -- --save-dev
npm install --save-dev jest @types/jest @testing-library/react-native
```

Add these `package.json` values:

```json
{
  "scripts": {
    "test": "jest --runInBand",
    "typecheck": "tsc --noEmit",
    "doctor": "expo-doctor"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

- [ ] **Step 3: Write the failing word-data test**

Create `src/data/words.test.ts`:

```ts
import { WORDS } from './words';

describe('WORDS', () => {
  it('contains five Oxford entries with only the allowed fields', () => {
    expect(WORDS).toHaveLength(5);

    for (const entry of WORDS) {
      expect(Object.keys(entry).sort()).toEqual(['oxfordUrl', 'word']);
      expect(entry.oxfordUrl).toMatch(
        /^https:\/\/www\.oxfordlearnersdictionaries\.com\/definition\/english\//,
      );
    }
  });
});
```

- [ ] **Step 4: Run the test and verify RED**

Run: `npm test -- src/data/words.test.ts`

Expected: FAIL because `./words` does not exist.

- [ ] **Step 5: Implement the type and five entries**

Create `src/types/word.ts`:

```ts
export type Word = {
  word: string;
  oxfordUrl: string;
};
```

Create `src/data/words.ts`:

```ts
import type { Word } from '../types/word';

export const WORDS: Word[] = [
  {
    word: 'example',
    oxfordUrl:
      'https://www.oxfordlearnersdictionaries.com/definition/english/example',
  },
  {
    word: 'apple',
    oxfordUrl:
      'https://www.oxfordlearnersdictionaries.com/definition/english/apple',
  },
  {
    word: 'curious',
    oxfordUrl:
      'https://www.oxfordlearnersdictionaries.com/definition/english/curious',
  },
  {
    word: 'learn',
    oxfordUrl:
      'https://www.oxfordlearnersdictionaries.com/definition/english/learn',
  },
  {
    word: 'resilient',
    oxfordUrl:
      'https://www.oxfordlearnersdictionaries.com/definition/english/resilient',
  },
];
```

Create the empty tracked file `src/services/.gitkeep`.

- [ ] **Step 6: Run the test and verify GREEN**

Run: `npm test -- src/data/words.test.ts`

Expected: PASS, 1 test.

- [ ] **Step 7: Commit**

```powershell
git add package.json package-lock.json app.json index.ts tsconfig.json assets src
git commit -m "chore: initialize Expo TypeScript app"
```

### Task 2: Implement the list, row, WebView, and split layout

**Files:**
- Create: `src/components/WordRow.tsx`
- Create: `src/components/WordList.tsx`
- Create: `src/components/DictionaryWebView.tsx`
- Create: `src/components/WordList.test.tsx`
- Create: `src/components/DictionaryWebView.test.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `Word` and `WORDS`
- Produces: `WordRow({ word, isSelected, onSelect })`
- Produces: `WordList({ words, selectedWord, onSelectWord })`
- Produces: `DictionaryWebView({ word })`

- [ ] **Step 1: Write the failing list interaction tests**

Create `src/components/WordList.test.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react-native';

import { WORDS } from '../data/words';
import { WordList } from './WordList';

describe('WordList', () => {
  it('reports the selected word when its label is pressed', () => {
    const onSelectWord = jest.fn();
    const screen = render(
      <WordList
        words={WORDS}
        selectedWord={WORDS[0]}
        onSelectWord={onSelectWord}
      />,
    );

    fireEvent.press(screen.getByText('curious'));

    expect(onSelectWord).toHaveBeenCalledWith(WORDS[2]);
  });

  it('keeps UK and US buttons clickable without selecting a word', () => {
    const onSelectWord = jest.fn();
    const screen = render(
      <WordList
        words={WORDS}
        selectedWord={WORDS[0]}
        onSelectWord={onSelectWord}
      />,
    );

    fireEvent.press(
      screen.getByLabelText('UK pronunciation placeholder for example'),
    );
    fireEvent.press(
      screen.getByLabelText('US pronunciation placeholder for example'),
    );

    expect(onSelectWord).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the list tests and verify RED**

Run: `npm test -- src/components/WordList.test.tsx`

Expected: FAIL because `./WordList` does not exist.

- [ ] **Step 3: Implement `WordRow` and `WordList`**

Create `src/components/WordRow.tsx`:

```tsx
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
```

Create `src/components/WordList.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the list tests and verify GREEN**

Run: `npm test -- src/components/WordList.test.tsx`

Expected: PASS, 2 tests.

- [ ] **Step 5: Write the failing WebView test**

Create `src/components/DictionaryWebView.test.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';

import { WORDS } from '../data/words';
import { DictionaryWebView } from './DictionaryWebView';

jest.mock('react-native-webview', () => ({
  WebView: (props: Record<string, unknown>) =>
    React.createElement(View, { ...props, testID: 'dictionary-webview' }),
}));

describe('DictionaryWebView', () => {
  it('loads the selected Oxford URL', () => {
    const screen = render(<DictionaryWebView word={WORDS[1]} />);

    expect(screen.getByTestId('dictionary-webview')).toHaveProp('source', {
      uri: WORDS[1].oxfordUrl,
    });
  });
});
```

- [ ] **Step 6: Run the WebView test and verify RED**

Run: `npm test -- src/components/DictionaryWebView.test.tsx`

Expected: FAIL because `./DictionaryWebView` does not exist.

- [ ] **Step 7: Implement the WebView and root layout**

Create `src/components/DictionaryWebView.tsx`:

```tsx
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
```

Replace `App.tsx` with:

```tsx
import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { DictionaryWebView } from './src/components/DictionaryWebView';
import { WordList } from './src/components/WordList';
import { WORDS } from './src/data/words';
import type { Word } from './src/types/word';

export default function App() {
  const [selectedWord, setSelectedWord] = useState<Word>(WORDS[0]);

  return (
    <SafeAreaView style={styles.safeArea}>
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
  );
}

const styles = StyleSheet.create({
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
```

- [ ] **Step 8: Run all tests and verify GREEN**

Run: `npm test`

Expected: PASS, 3 suites and 4 tests.

- [ ] **Step 9: Commit**

```powershell
git add App.tsx src/components
git commit -m "feat: add split dictionary viewer"
```

### Task 3: Add user documentation and verify the project

**Files:**
- Modify: `README.md`
- Create: `docs/oxford-audio-dom.md`

**Interfaces:**
- Documents: Windows and iPhone Expo Go startup
- Documents: an intentionally selector-free future DOM observation log

- [ ] **Step 1: Write the README**

Replace `README.md` with setup requirements, `npm install`, `npx expo start`, QR scanning from iPhone Expo Go on the same LAN, a `npx expo start --tunnel` fallback, scripts, project structure, and the first-phase limitations.

- [ ] **Step 2: Create the DOM observation document**

Create `docs/oxford-audio-dom.md` with a warning not to guess selectors and empty headings for observation date, Oxford URL, UK control, US control, playback behavior, and notes.

- [ ] **Step 3: Run complete verification**

Run:

```powershell
npm test
npm run typecheck
npx expo-doctor
```

Expected: all commands exit 0.

- [ ] **Step 4: Audit scope**

Run:

```powershell
rg -n "speechSynthesis|expo-speech|AsyncStorage|sqlite|favorite|search|injectedJavaScript|querySelector|audioUrl" .
```

Expected: no production-code matches.

- [ ] **Step 5: Commit**

```powershell
git add README.md docs/oxford-audio-dom.md
git commit -m "docs: add Expo Go setup guide"
```
