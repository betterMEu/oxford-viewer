const OXFORD_DEFINITION_LAYOUT_WIDTH = 320;
const SCALE_STYLE_ID = 'oxford-viewer-definition-page-scale';

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
  const bodyWidth =
    Math.round((100 / scale) * 10_000) / 10_000;

  return `
    (function () {
      var styleId = '${SCALE_STYLE_ID}';
      var scale = ${scale};
      var existingStyle = document.getElementById(styleId);

      function stopScaleObserver() {
        if (window.__oxfordDefinitionPageScaleObserver) {
          window.__oxfordDefinitionPageScaleObserver.disconnect();
          window.__oxfordDefinitionPageScaleObserver = null;
        }
      }

      if (scale >= 1) {
        stopScaleObserver();
        window.__oxfordDefinitionPageScale = 1;

        if (existingStyle) {
          existingStyle.remove();
        }
        return;
      }

      function applyScale() {
        var target = document.head || document.documentElement;

        if (!target) {
          return false;
        }

        var style = document.getElementById(styleId);

        if (!style) {
          style = document.createElement('style');
          style.id = styleId;
          target.appendChild(style);
        }

        style.textContent =
          'html { overflow-x: hidden !important; } ' +
          'body { min-width: 320px !important; ' +
          'zoom: ${scale} !important; ' +
          'width: ${bodyWidth}% !important; }';
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
