export function buildDefinitionAutoScrollScript(): string {
  return `
    (function () {
      var target = document.querySelector('#entryContent');

      if (!target) {
        return;
      }

      var targetTop =
        target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, targetTop);
    })();
    true;
  `;
}
