/* Postaw na Polskie — /media: przyciski „Kopiuj” przy gotowych tekstach postów.
   main.js blokuje zdarzenie copy poza polami formularzy, dlatego teksty są w <textarea readonly>,
   a kopiowanie idzie przez navigator.clipboard.writeText (fallback: zaznaczenie + execCommand w polu). */
(function () {
  'use strict';

  function fallback(ta) {
    ta.focus();
    ta.select();
    try { return document.execCommand('copy'); } catch (e) { return false; }
  }

  function start() {
    document.querySelectorAll('[data-kopiuj]').forEach(function (btn) {
      var ta = document.getElementById(btn.getAttribute('data-kopiuj'));
      if (!ta) return;
      var status = btn.parentNode.querySelector('[data-kopiuj-status]');
      var timer;
      var pokaz = function (ok) {
        if (!status) return;
        status.textContent = ok ? 'Skopiowano do schowka.' : 'Nie udało się skopiować. Zaznacz tekst w polu i skopiuj ręcznie.';
        clearTimeout(timer);
        timer = setTimeout(function () { status.textContent = ''; }, 4000);
      };
      btn.hidden = false;
      var lab = document.querySelector('label[for="' + ta.id + '"]');
      if (lab) btn.setAttribute('aria-label', 'Kopiuj: ' + lab.textContent);
      btn.addEventListener('click', function () {
        var tekst = ta.value;
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(tekst).then(function () { pokaz(true); }, function () { pokaz(fallback(ta)); });
        } else {
          pokaz(fallback(ta));
        }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
