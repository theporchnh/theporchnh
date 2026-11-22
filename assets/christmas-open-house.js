(() => {
  'use strict';

  const banner = document.getElementById('porch-christmas');
  if (!banner) return;

  const dismissalKey = 'porch-christmas-2026-dismissed';
  const eventEnd = Date.parse('2026-12-06T14:00:00-05:00');
  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem(dismissalKey) === 'true';
  } catch (_) {
    // The banner still works when browser storage is unavailable.
  }

  if (Date.now() >= eventEnd || dismissed) {
    banner.hidden = true;
    return;
  }

  const closeButton = banner.querySelector('.porch-christmas__close');
  closeButton.hidden = false;
  closeButton.addEventListener('click', () => {
    banner.hidden = true;
    try {
      sessionStorage.setItem(dismissalKey, 'true');
    } catch (_) {}

    // Move keyboard focus back into the page after removing the banner.
    const nextLink = document.querySelector('body a:not(.porch-christmas a)');
    if (nextLink) nextLink.focus({ preventScroll: true });
  });
})();
