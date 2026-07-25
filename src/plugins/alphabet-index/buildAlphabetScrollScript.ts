import type { AlphabetLetter } from './AlphabetIndexPlugin';

export function buildAlphabetScrollScript(
  letter: AlphabetLetter,
): string {
  return `
    (function () {
      var requestedLetter = '${letter}';
      var items = document.querySelectorAll('li[data-hw][data-ox3000]');
      var target = null;

      for (var index = 0; index < items.length; index += 1) {
        var item = items[index];
        var word = (item.getAttribute('data-hw') || '').trim();
        var isVisible = getComputedStyle(item).display !== 'none';

        if (
          isVisible &&
          word.charAt(0).toUpperCase() === requestedLetter
        ) {
          target = item;
          break;
        }
      }

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
