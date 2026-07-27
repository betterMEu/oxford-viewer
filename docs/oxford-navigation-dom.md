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
The app sets `scroll-margin-top` on `#entryContent` before alignment so the
word heading remains below the iPhone top safe area. Because the definition
page can be scaled in portrait, the CSS margin is calculated as:

```text
native top inset / active definition page scale
```

This preserves the same visual safe-area gap at every portrait scale.

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

At a narrow browser viewport representative of the portrait definition pane,
the Oxford page reported about 225px of root client width and 327px of root
scroll width. The body and `.responsive_container` both retained their 320px
minimum width.

An earlier implementation applied CSS `zoom` while expanding the body to
`100 / scale %`, then hid root overflow. Physical iPhone testing confirmed that
the page remained visibly draggable from side to side. The reciprocal body
width preserved a layout wider than the pane, and CSS overflow did not
reliably reduce the native `WKWebView` scroll content size.

The definition page now uses viewport-level scaling in portrait:

```text
scale = min(1, native definition pane width / 320)
viewport width = 320 CSS pixels
viewport initial-scale = scale
```

The app stores Oxford's original viewport content and updates the existing
viewport meta element to `width=320, initial-scale=<scale>`. A small app-owned
style fixes `html` and `body` at that same logical width and hides only residual
root overflow. It does not use CSS `zoom`, transforms, or reciprocal percentage
widths.

If the viewport meta element is not yet present at document start, the app
installs a `MutationObserver` before the entry auto-scroll observer. The active
scale is published only after the viewport and width style are applied, so
safe-area entry alignment uses the same scale visible to the user.

In landscape, Oxford's stored viewport content is restored, the app-owned width
style is removed, and the active scale is reset to `1`. The word-list WebView
receives no sizing script and continues to use Oxford's native page sizing in
both orientations.

## Risks

- Oxford can change `data-hw`, `data-ox3000`, `#entryContent`, ordering,
  responsive layout, or page loading behavior without notice.
- Late-loading advertising or other Oxford-controlled content can change page
  geometry after load.
- The automated tests verify generated scripts and WebView integration; iPhone
  Expo Go must still be used to confirm that native horizontal panning is gone
  and that visual scale and safe-area alignment remain correct.
