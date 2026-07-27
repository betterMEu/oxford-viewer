export function buildDefinitionAutoScrollScript(
  topInset = 0,
): string {
  const safeTopInset =
    Number.isFinite(topInset) && topInset > 0 ? topInset : 0;

  return `
    (function () {
      var topInset = ${safeTopInset};

      function scrollToEntry() {
        var target = document.querySelector('#entryContent');

        if (!target) {
          return false;
        }

        var pageScale =
          typeof window.__oxfordDefinitionPageScale === 'number' &&
          isFinite(window.__oxfordDefinitionPageScale) &&
          window.__oxfordDefinitionPageScale > 0
            ? window.__oxfordDefinitionPageScale
            : 1;
        var scrollMarginTop =
          Math.round((topInset / pageScale) * 10000) / 10000;

        target.style.scrollMarginTop = scrollMarginTop + 'px';
        target.scrollIntoView({
          block: 'start',
          behavior: 'auto'
        });

        if (window.__oxfordDefinitionAutoScrollObserver) {
          window.__oxfordDefinitionAutoScrollObserver.disconnect();
          window.__oxfordDefinitionAutoScrollObserver = null;
        }

        return true;
      }

      if (scrollToEntry()) {
        return;
      }

      if (window.__oxfordDefinitionAutoScrollInstalled) {
        return;
      }

      window.__oxfordDefinitionAutoScrollInstalled = true;
      window.__oxfordDefinitionAutoScrollObserver =
        new MutationObserver(function () {
          scrollToEntry();
        });
      window.__oxfordDefinitionAutoScrollObserver.observe(
        document,
        {
          childList: true,
          subtree: true
        }
      );

      window.addEventListener('load', function () {
        scrollToEntry();
      }, {
        once: true
      });
    })();
    true;
  `;
}
