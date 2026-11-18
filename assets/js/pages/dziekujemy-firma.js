/* Postaw na Polskie — /dziekujemy/firma/?typ=polecenie|znak.
   Bez parametru (i bez JS) zostaje domyślny komunikat po zgłoszeniu firmy. Teksty: STRUKTURA_I_TEKSTY 6.4. */
(function () {
  'use strict';
  var typ = '';
  try { typ = new URLSearchParams(location.search).get('typ') || ''; } catch (e) { return; }
  var T = {
    polecenie: {
      poz: 'Polecenie firmy',
      h1: 'Dziękujemy za polecenie.',
      lead: 'Zapytamy firmę, czy chce być w katalogu. Bez jej zgody nie opublikujemy wpisu.',
      stan: [['Polecenie', 'Przyjęte'], ['Następny krok', 'Kontakt z firmą i pytanie o zgodę'], ['Publikacja', 'Dopiero po weryfikacji i zgodzie firmy'], ['Opłata', 'Brak. Wpis jest bezpłatny']]
    },
    znak: {
      poz: 'Znak kampanii',
      h1: 'Firma zapisana na znak.',
      lead: 'Damy znać, gdy ruszy znak kampanii dla firm. Zapis nie jest przyznaniem znaku.',
      stan: [['Zapis', 'Przyjęty'], ['Znak', 'W przygotowaniu. Ruszy w drugim etapie kampanii'], ['Warunek', 'Regulamin licencji i weryfikacja firmy']]
    }
  };
  var t = T[typ];
  if (!t) return;
  var q = function (s) { return document.querySelector(s); };
  var set = function (s, v) { var el = q(s); if (el) el.textContent = v; };
  set('[data-typ-poz]', t.poz);
  set('[data-typ-h1]', t.h1);
  set('[data-typ-lead]', t.lead);
  document.title = t.h1.replace(/\.$/, '') + ' · Postaw na Polskie';
  var dl = q('[data-typ-stan]');
  if (dl) {
    dl.textContent = '';
    t.stan.forEach(function (r) {
      var w = document.createElement('div'); w.className = 'wiersz';
      var dt = document.createElement('dt'); dt.textContent = r[0];
      var dd = document.createElement('dd'); dd.textContent = r[1];
      w.appendChild(dt); w.appendChild(dd); dl.appendChild(w);
    });
  }
  // Sekcja „Pokaż, że jesteście w kolejce” dotyczy tylko firmy, która sama się zgłosiła.
  var krok = q('[data-typ-krok]');
  if (krok) krok.hidden = true;
})();
