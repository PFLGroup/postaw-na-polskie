/* Postaw na Polskie — komunikaty walidacji po polsku (STRUKTURA_I_TEKSTY 6.3).
   Wysyłkę obsługuje main.js (form[data-pnp-form]); ten plik tylko podmienia treść dymków walidacji.
   Komunikat pola: atrybut data-msg, inaczej domyślny poniżej. Bez JS działa walidacja natywna przeglądarki. */
(function () {
  'use strict';

  var EMAIL = 'Ten adres wygląda na niepełny. Sprawdź, czy jest w nim @ i domena.';
  var URL_MSG = 'Wpisz pełny adres, razem z https://';
  var ZGODA = 'Bez tej zgody nie możemy przyjąć zgłoszenia.';
  var WYMAGANE = 'To pole jest potrzebne, żebyśmy mogli przyjąć zgłoszenie.';

  function komunikat(el) {
    var v = el.validity;
    if (v.valid) return '';
    if (el.type === 'checkbox') return el.getAttribute('data-msg') || ZGODA;
    if (el.type === 'radio') {
      var pierwszy = el.form && el.form.querySelector('input[type=radio][name="' + el.name + '"][data-msg]');
      return (pierwszy && pierwszy.getAttribute('data-msg')) || WYMAGANE;
    }
    if (v.valueMissing) return el.getAttribute('data-msg') || WYMAGANE;
    if (el.type === 'email' && (v.typeMismatch || v.patternMismatch)) return EMAIL;
    if (el.type === 'url' && v.typeMismatch) return URL_MSG;
    if (v.tooLong) return 'Ten tekst jest za długi. Skróć go do ' + el.maxLength + ' znaków.';
    return '';
  }

  function wyczysc(e) {
    var el = e.target;
    if (!el.setCustomValidity) return;
    if (el.type === 'radio' && el.form) {
      el.form.querySelectorAll('input[type=radio][name="' + el.name + '"]').forEach(function (r) { r.setCustomValidity(''); });
    } else {
      el.setCustomValidity('');
    }
  }

  document.querySelectorAll('form[data-pnp-form]').forEach(function (f) {
    f.addEventListener('invalid', function (e) {
      var el = e.target;
      if (!el.setCustomValidity) return;
      el.setCustomValidity('');
      if (!el.validity.valid) el.setCustomValidity(komunikat(el));
    }, true);
    f.addEventListener('input', wyczysc, true);
    f.addEventListener('change', wyczysc, true);
  });
})();
