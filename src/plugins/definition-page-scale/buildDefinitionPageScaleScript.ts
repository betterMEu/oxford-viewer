const OXFORD_DEFINITION_LAYOUT_WIDTH = 320;
const SCALE_STYLE_ID = 'oxford-viewer-definition-page-scale';
const VIEWPORT_SELECTOR = 'meta[name="viewport"]';
const ORIGINAL_VIEWPORT_CONTENT_ATTRIBUTE =
  'data-oxford-viewer-original-content';

export function buildDefinitionPageScaleScript(
  paneWidth: number,
  shrinkToFit: boolean,
): string {
  const safePaneWidth =
    Number.isFinite(paneWidth) && paneWidth > 0
      ? paneWidth
      : OXFORD_DEFINITION_LAYOUT_WIDTH;
  const rawScale = shrinkToFit
    ? Math.min(
        1,
        safePaneWidth / OXFORD_DEFINITION_LAYOUT_WIDTH,
      )
    : 1;
  const scale = Math.round(rawScale * 10_000) / 10_000;

  return `
    (function () {
      var styleId = '${SCALE_STYLE_ID}';
      var viewportSelector = '${VIEWPORT_SELECTOR}';
      var originalViewportContentAttribute =
        '${ORIGINAL_VIEWPORT_CONTENT_ATTRIBUTE}';
      var scale = ${scale};
      var existingStyle = document.getElementById(styleId);

      function stopScaleObserver() {
        if (window.__oxfordDefinitionPageScaleObserver) {
          window.__oxfordDefinitionPageScaleObserver.disconnect();
          window.__oxfordDefinitionPageScaleObserver = null;
        }
      }

      function restoreViewport() {
        var viewport = document.querySelector(viewportSelector);

        if (
          !viewport ||
          !viewport.hasAttribute(
            originalViewportContentAttribute
          )
        ) {
          return;
        }

        viewport.setAttribute(
          'content',
          viewport.getAttribute(
            originalViewportContentAttribute
          ) || ''
        );
        viewport.removeAttribute(
          originalViewportContentAttribute
        );
      }

      if (scale >= 1) {
        stopScaleObserver();
        restoreViewport();
        window.__oxfordDefinitionPageScale = 1;

        if (existingStyle) {
          existingStyle.remove();
        }
        return;
      }

      function applyScale() {
        var target = document.head || document.documentElement;
        var viewport = document.querySelector(viewportSelector);

        if (!target || !viewport) {
          return false;
        }

        if (
          !viewport.hasAttribute(
            originalViewportContentAttribute
          )
        ) {
          viewport.setAttribute(
            originalViewportContentAttribute,
            viewport.getAttribute('content') || ''
          );
        }
        viewport.setAttribute(
          'content',
          'width=320, initial-scale=${scale}'
        );

        var style = document.getElementById(styleId);

        if (!style) {
          style = document.createElement('style');
          style.id = styleId;
          target.appendChild(style);
        }

        style.textContent =
          'html { overflow-x: hidden !important; } ' +
          'html, body { width: 320px !important; } ' +
          'body { max-width: 320px !important; ' +
          'min-width: 320px !important; }';
        stopScaleObserver();
        window.__oxfordDefinitionPageScale = scale;
        return true;
      }

      window.__oxfordDefinitionPageScale = 1;

      if (!applyScale()) {
        stopScaleObserver();
        window.__oxfordDefinitionPageScaleObserver =
          new MutationObserver(function () {
            applyScale();
          });
        window.__oxfordDefinitionPageScaleObserver.observe(document, {
          childList: true,
          subtree: true
        });
      }
    })();
    true;
  `;
}
