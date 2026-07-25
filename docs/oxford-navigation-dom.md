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
distance. After a successful load it calculates:

```js
var targetTop =
  target.getBoundingClientRect().top + window.scrollY;
window.scrollTo(0, targetTop);
```

Positioning `#entryContent` at the top skips Oxford's page header while
preserving the word heading, phonetics, and native pronunciation controls.
Positioning the first `.sense` instead would hide those useful entry controls.

## Risks

- Oxford can change `data-hw`, `data-ox3000`, `#entryContent`, ordering,
  responsive layout, or page loading behavior without notice.
- Late-loading advertising or other Oxford-controlled content can change page
  geometry after load.
- The automated tests verify generated scripts and WebView integration; iPhone
  Expo Go behavior still requires real-device acceptance testing.
