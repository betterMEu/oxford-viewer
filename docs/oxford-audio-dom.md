# Oxford Audio DOM Investigation

Investigation date: 2026-07-25

## Current application design

This document is retained as a historical DOM investigation. The current
implementation does not inject these pronunciation selectors into Oxford
definition pages and does not recreate pronunciation controls.

The left pane now displays Oxford's official word-list page in one WebView.
Its existing UK and US controls and Oxford's own event handlers remain intact,
so playback is initiated by the user directly on the Oxford page. The app does
not extract, return, download, cache, or save Oxford audio URLs.

## Test page

URL:

https://www.oxfordlearnersdictionaries.com/definition/english/abandon_1

## UK pronunciation

Button HTML:

```html
<div class="sound audio_play_button pron-uk icon-audio"
     data-src-mp3="https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/a/aba/aband/abandon__gb_2.mp3"
     data-src-ogg="https://www.oxfordlearnersdictionaries.com/media/english/uk_pron_ogg/a/aba/aband/abandon__gb_2.ogg"
     title="abandon pronunciation
                    English"
     style="cursor: pointer"
     valign="top">&nbsp;</div>
```

- HTML tag: `div`
- `id`: none
- `class`: `sound audio_play_button pron-uk icon-audio`
- Data attributes:
  - `data-src-mp3`: the UK MP3 URL shown above
  - `data-src-ogg`: the UK OGG URL shown above
- Other observed attributes: `title`, `style`, and `valign`

Selector:

```css
#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_br > .audio_play_button.pron-uk
```

This selector matched exactly one element on the test page at the time of
investigation.

Audio element:

No `<audio>` element was present in the document before the click or after the
click. After a real click on the UK control, the browser observed
`abandon__gb_2.mp3` loading as an `audio` resource. The location and type of any
script-internal audio player object are `UNKNOWN`.

Trigger method:

A click on the `div.audio_play_button.pron-uk` control triggered loading of the
URL in `data-src-mp3`. There was no inline `onclick` attribute. The exact event
listener implementation is `UNKNOWN`. Whether calling `HTMLElement.click()`
from injected JavaScript triggers playback is `UNKNOWN`; no JavaScript was
injected during this investigation.

## US pronunciation

Button HTML:

```html
<div class="sound audio_play_button pron-us icon-audio"
     data-src-mp3="https://www.oxfordlearnersdictionaries.com/media/english/us_pron/a/aba/aband/abandon__us_2.mp3"
     data-src-ogg="https://www.oxfordlearnersdictionaries.com/media/english/us_pron_ogg/a/aba/aband/abandon__us_2.ogg"
     title="abandon pronunciation
                    American"
     style="cursor: pointer"
     valign="top">&nbsp;</div>
```

- HTML tag: `div`
- `id`: none
- `class`: `sound audio_play_button pron-us icon-audio`
- Data attributes:
  - `data-src-mp3`: the US MP3 URL shown above
  - `data-src-ogg`: the US OGG URL shown above
- Other observed attributes: `title`, `style`, and `valign`

Selector:

```css
#entryContent > .entry > .top-container > .top-g > .webtop > .phonetics > .phons_n_am > .audio_play_button.pron-us
```

This selector matched exactly one element on the test page at the time of
investigation.

Audio element:

No `<audio>` element was present in the document before the click or after the
click. After a real click on the US control, the browser observed
`abandon__us_2.mp3` loading as an `audio` resource. The location and type of any
script-internal audio player object are `UNKNOWN`.

Trigger method:

A click on the `div.audio_play_button.pron-us` control triggered loading of the
URL in `data-src-mp3`. There was no inline `onclick` attribute. The exact event
listener implementation is `UNKNOWN`. Whether calling `HTMLElement.click()`
from injected JavaScript triggers playback is `UNKNOWN`; no JavaScript was
injected during this investigation.

## Risks

- The controls have no `id`; selectors depend on Oxford's current class names
  and DOM hierarchy.
- Broad selectors such as `.pron-uk` and `.pron-us` are unsafe. The test page
  also contains pronunciation controls for hidden verb forms and the Word of
  the Day.
- The `title` attribute contains variable whitespace and is not a reliable
  selector.
- Oxford can change the DOM, classes, media URLs, event implementation, or
  access policy without notice.
- No `<audio>` element is exposed in the DOM. Playback is managed by
  page-internal JavaScript whose implementation remains `UNKNOWN`.
- A real browser click was confirmed, but a WebView-injected JavaScript click
  was not tested and may be affected by trusted-event or media-playback
  restrictions.
