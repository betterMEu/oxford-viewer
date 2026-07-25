export function buildDefinitionAutoScrollScript(): string {
  return `
    (function () {
      if (window.__oxfordDefinitionAutoScrollInstalled) {
        return;
      }

      window.__oxfordDefinitionAutoScrollInstalled = true;
      var observer = null;

      function scrollToEntry() {
        var target = document.querySelector('#entryContent');

        if (!target) {
          return false;
        }

        target.scrollIntoView({
          block: 'start',
          behavior: 'auto'
        });

        if (observer) {
          observer.disconnect();
          observer = null;
        }

        return true;
      }

      if (!scrollToEntry()) {
        observer = new MutationObserver(function () {
          scrollToEntry();
        });
        observer.observe(document, {
          childList: true,
          subtree: true
        });
      }

      window.addEventListener('load', function () {
        scrollToEntry();
      }, {
        once: true
      });
    })();
    true;
  `;
}
