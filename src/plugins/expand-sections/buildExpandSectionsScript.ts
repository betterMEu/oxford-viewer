// Mirror Oxford entry.js without waiting for DOMContentLoaded / jQuery ready.
export const EXPAND_SECTIONS_SCRIPT = `
(function () {
  if (window.__oxfordExpandSectionsInstalled) return;
  window.__oxfordExpandSectionsInstalled = true;
  document.addEventListener('click', function (event) {
    var target = event.target;
    var title = target && target.closest
      ? target.closest('.unbox .box_title, .unbox .heading') : null;
    if (!title) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    title.parentElement.classList.toggle('is-active');
  }, true);
})(); true;
`;
