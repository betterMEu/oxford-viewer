# Alphabet Index and Definition Auto-Scroll Design

## Goal

Add a compact A–Z index between the Oxford 3000 word-list WebView and the
definition WebView. Selecting a letter scrolls the left Oxford page to the
first visible Oxford 3000 entry beginning with that letter. After a definition
page loads, the right WebView automatically skips Oxford's page header and
positions the dictionary entry at the top.

## Verified Oxford DOM

Investigation date: 2026-07-25.

Word-list page:

`https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000`

- Oxford 3000 entries use `li[data-hw][data-ox3000]`.
- 3,805 matching entries were present.
- The first word for a letter is found by reading `data-hw` in DOM order.
- A–W, Y, and Z had matches. Oxford 3000 had no X entry, so X is visible in
  the index but disabled.

Definition test page:

`https://www.oxfordlearnersdictionaries.com/definition/english/abandon_1`

- The dictionary entry begins at `#entryContent`.
- At a 500×390 viewport, `#entryContent` began about 370px below the document
  top and the first `.sense` began about 601px below the top.
- At a 1280×720 viewport, the offsets were about 504px and 735px.
- The implementation must not hardcode any of these measurements. It scrolls
  to the current document position of `#entryContent`, preserving the word
  heading, phonetics, and native pronunciation controls.

## Architecture

The feature is implemented as project-local plugins, not as an external npm
package and not as UI injected into Oxford's page:

- `src/plugins/alphabet-index/AlphabetIndexPlugin.tsx` renders the native
  vertical A–Z strip.
- `src/plugins/alphabet-index/buildAlphabetScrollScript.ts` builds the small
  WebView script that locates a visible `li[data-hw][data-ox3000]` and scrolls
  the Oxford document.
- `OxfordWordListWebView` exposes a narrow imperative `scrollToLetter(letter)`
  API through a ref. The App never receives Oxford word-list text.
- `src/plugins/definition-auto-scroll/buildDefinitionAutoScrollScript.ts`
  builds the right-page script that dynamically positions `#entryContent`.
- `DictionaryWebView` injects that script only after a successful load.

## Data Flow

1. The left page loads and applies the existing Oxford 3000 filter.
2. The filter success message enables the A–Z index.
3. A letter press calls `OxfordWordListWebView.scrollToLetter(letter)`.
4. The left WebView receives a script containing only the selected letter.
5. The script reads `data-hw`, finds the first visible matching entry, and
   scrolls to its current document top.
6. A definition link still updates only the right WebView.
7. When the definition load ends without an error, the right WebView scrolls
   to the current top of `#entryContent`.

## Error Handling

- The A–Z strip is disabled until the Oxford 3000 filter is confirmed.
- X remains visible but disabled because the verified Oxford 3000 DOM has no
  X entry.
- If a letter target is missing because Oxford changed its DOM, the injected
  script performs no scroll and does not crash.
- If `#entryContent` is missing, the definition script performs no scroll.
- A right-page load error preserves the existing concise error overlay and
  suppresses auto-scroll injection for that failed load.

## Testing

- Unit-test the 26 letters, letter callbacks, global disabled state, and
  disabled X behavior.
- Unit-test both generated scripts for their verified selectors, dynamic
  coordinate calculation, safe missing-target branches, and `true;` ending.
- Component-test the left WebView imperative API and its injection timing.
- Component-test right-page auto-scroll after load end and suppression after
  errors.
- App-test that the alphabet index is between the panes, is disabled before
  filter success, becomes enabled after success, and injects the selected
  letter.

## Scope

No new dependency, search, favorites, database, TTS, Oxford content parsing,
audio extraction, caching, or persistence is added. Expo remains SDK 54.
