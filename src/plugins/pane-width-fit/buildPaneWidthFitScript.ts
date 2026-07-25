const STYLE_ELEMENT_ID = 'oxford-viewer-pane-width-fit';

export function buildPaneWidthFitScript(enabled: boolean): string {
  return `
    (function () {
      var styleElement = document.getElementById('${STYLE_ELEMENT_ID}');

      if (!${enabled}) {
        if (styleElement) {
          styleElement.remove();
        }
        return;
      }

      function installStyle() {
        var styleParent = document.head || document.documentElement;

        if (!styleParent) {
          return false;
        }

        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = '${STYLE_ELEMENT_ID}';
          styleParent.appendChild(styleElement);
        }

        styleElement.textContent = \`
          html,
          body,
          .responsive_container,
          .responsive_row {
            box-sizing: border-box !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }

          html,
          body {
            overflow-x: hidden !important;
            width: 100% !important;
          }
        \`;
        return true;
      }

      if (!installStyle()) {
        document.addEventListener('DOMContentLoaded', installStyle, {
          once: true
        });
      }
    })();
    true;
  `;
}
