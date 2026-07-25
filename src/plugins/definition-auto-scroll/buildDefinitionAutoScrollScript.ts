export function buildDefinitionAutoScrollScript(): string {
  return `
    (function () {
      function scrollToEntry() {
        var target = document.querySelector('#entryContent');

        if (!target) {
          return;
        }

        target.scrollIntoView({
          block: 'start',
          behavior: 'auto'
        });
      }

      scrollToEntry();
      [250, 750, 1500].forEach(function (delay) {
        setTimeout(scrollToEntry, delay);
      });
    })();
    true;
  `;
}
