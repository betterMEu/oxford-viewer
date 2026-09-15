import type { AlphabetLetter } from './AlphabetIndexPlugin';

export function buildAlphabetScrollScript(
  letter: AlphabetLetter,
  scrollNestedContainers = false,
): string {
  return `
    (function () {
      var requestedLetter = '${letter}';
      var items = document.querySelectorAll('#wordlistsContentPanel li[data-hw]');
      var target = null;

      for (var index = 0; index < items.length; index += 1) {
        var item = items[index];
        var word = (item.getAttribute('data-hw') || '').trim();
        var isVisible = item.getClientRects().length > 0 && getComputedStyle(item).visibility !== 'hidden';

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

      ${scrollNestedContainers ? "target.scrollIntoView({ block: 'start', behavior: 'instant' });" : ''}
      var targetTop =
        target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, targetTop);
    })();
    true;
  `;
}
