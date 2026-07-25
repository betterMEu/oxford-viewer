# Oxford Navigation DOM Investigation

Investigation date: 2026-07-25

## Word-list page

URL:

https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000

Verified Oxford 3000 selector:

```css
li[data-hw][data-ox3000]
```

Observed matching entries: 3,805.

The page is in alphabetical DOM order. The plugin reads `data-hw` and selects
the first visible entry whose first uppercase character equals the requested
letter. It does not copy or return the word text to React Native.

Verified first entries included:

- A: `a`
- B: `baby`
- C: `cable`
- W: `wage`
- Y: `yard`
- Z: `zero`

No Oxford 3000 entry beginning with X was present. The native A–Z strip keeps X
visible but disabled.

## Definition page

Test URL:

https://www.oxfordlearnersdictionaries.com/definition/english/abandon_1

Verified dictionary entry selector:

```css
#entryContent
```

Verified first-sense selector:

```css
#entryContent .sense
```

Observed document offsets at initial scroll position:

| Viewport | `#entryContent` | First `.sense` |
| --- | ---: | ---: |
| 500×390 | about 370px | about 601px |
| 1280×720 | about 504px | about 735px |

The offsets change with responsive layout, so the app does not use a fixed
distance. After a successful load it positions the verified element with:

```js
target.scrollIntoView({
  block: 'start',
  behavior: 'auto'
});
```

Positioning `#entryContent` at the top skips Oxford's page header while
preserving the word heading, phonetics, and native pronunciation controls.
Positioning the first `.sense` instead would hide those useful entry controls.

Oxford-controlled content can appear or reflow after the WebView's load event.
A single script injected only after that event can therefore miss the earliest
usable moment. The WebView now installs one `MutationObserver` before content
loads. It scrolls immediately if `#entryContent` already exists, or as soon as
that element is inserted, then disconnects the observer. The page load event
and WebView load-end injection remain immediate fallbacks; there are no fixed
retry delays.

## Split-pane width

Both investigated Oxford pages declare a mobile viewport:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Oxford's current styles still impose widths that can exceed an iPhone split
pane:

```css
body {
  min-width: 320px;
}

.responsive_container {
  min-width: 320px;
}

.responsive_row {
  min-width: 300px;
}
```

As of 2026-07-26, the app does not override these widths or apply CSS zoom.
Both the definition page and word-list page use Oxford's native page sizing in
portrait and landscape.

## Risks

- Oxford can change `data-hw`, `data-ox3000`, `#entryContent`, ordering,
  responsive layout, or page loading behavior without notice.
- Late-loading advertising or other Oxford-controlled content can change page
  geometry after load.
- The automated tests verify generated scripts and WebView integration; iPhone
  Expo Go behavior still requires real-device acceptance testing.
