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

        var paneWidth =
          document.documentElement.clientWidth || window.innerWidth;
        var scale = Math.min(1, paneWidth / 320);
        var compensatedWidth = 100 / scale;

        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = '${STYLE_ELEMENT_ID}';
          styleParent.appendChild(styleElement);
        }

        styleElement.textContent =
          'html {' +
            'overflow-x: hidden !important;' +
          '}' +
          'body {' +
            'min-width: 320px !important;' +
            'width: ' + compensatedWidth + '% !important;' +
            'zoom: ' + scale + ' !important;' +
          '}';
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
