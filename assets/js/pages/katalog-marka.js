/* Postaw na Polskie — /katalog/marka/?m=<slug>: pełna etykieta firmy z data/marki.json. */
(function () {
  'use strict';

  var KAPITAL = { 'polski-spoldzielczy': 'polski (spółdzielczy)' };
  function kapital(v) { return KAPITAL[v] || v || ''; }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  // wiersz etykiety; puste wartości pomijamy (nie pokazujemy „brak danych”)
  function wiersz(k, v, mocny) {
    if (v === null || v === undefined || v === '') return null;
    var dd = el('dd', { class: 'wiersz__v' });
    if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v);
    return el('div', { class: 'wiersz' + (mocny ? ' wiersz--mocny' : '') }, [el('dt', { class: 'wiersz__k', text: k }), dd]);
  }

  function zrodlo(m) {
    if (!m.zrodlo_nazwa) return null;
    if (m.zrodlo_url) return el('a', { href: m.zrodlo_url, target: '_blank', rel: 'noopener', text: m.zrodlo_nazwa });
    return m.zrodlo_nazwa;
  }

  function pole(lit, nazwa, wartosc, zr) {
    var dd = el('dd');
    if (wartosc) {
      dd.appendChild(document.createTextNode(wartosc));
      if (zr) dd.appendChild(el('small', { text: 'wg ' + zr }));
    } else {
      dd.className = 'metr__brak';
      dd.appendChild(el('span', { 'aria-hidden': 'true', text: '—' }));
      dd.appendChild(el('span', { class: 'sr-only', text: 'w weryfikacji' }));
    }
    return el('div', null, [el('dt', null, [el('b', { 'aria-hidden': 'true', text: lit }), el('span', { class: 'metr__nazwa', text: nazwa })]), dd]);
  }

  function start() {
    var wrap = document.getElementById('firma');
    if (!wrap) return;
    var slug = new URLSearchParams(location.search).get('m') || '';
    var brak = document.getElementById('brak');
    var h1 = document.getElementById('firma-h1');

    function nieznana() {
      h1.textContent = 'Nie ma takiej etykiety';
      document.getElementById('okruch-nazwa').textContent = 'Nie znaleziono';
      document.title = 'Nie ma takiej etykiety · Postaw na Polskie';
      brak.hidden = false;
    }

    fetch(wrap.getAttribute('data-zrodlo'))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (dane) {
        var m = null;
        for (var i = 0; i < dane.length; i++) if (dane[i].slug === slug) { m = dane[i]; break; }
        if (!m) { nieznana(); return; }

        h1.textContent = m.nazwa;
        document.getElementById('okruch-nazwa').textContent = m.nazwa;
        document.title = m.nazwa + ' · Polska półka · Postaw na Polskie';
        var miejsce = [m.miasto, m.wojewodztwo].filter(Boolean).join(', ');
        document.getElementById('firma-linia').textContent =
          [m.kategoria, miejsce].filter(Boolean).join(' · ');
        document.getElementById('et-tytul').textContent = m.nazwa;

        var dl = document.getElementById('et-wiersze');
        [
          wiersz('Kategoria', m.kategoria),
          wiersz('Siedziba', miejsce),
          wiersz('Właściciel', m.wlasciciel),
          wiersz('Kapitał', kapital(m.kapital)),
          wiersz('Fakt', m.fakt),
          wiersz('Rok danych', m.rok_danych ? String(m.rok_danych) : null),
          wiersz('Źródło', zrodlo(m)),
          wiersz('Kupujący', 'Ty', true)
        ].forEach(function (w) { if (w) dl.appendChild(w); });

        var zrKrotkie = m.zrodlo_nazwa ? m.zrodlo_nazwa.split(':')[0] : '';
        var md = document.getElementById('metr-duza');
        [
          pole('S', 'Siedziba', miejsce),
          pole('P', 'Produkcja', ''),
          pole('K', 'Kapitał', kapital(m.kapital), zrKrotkie),
          pole('T', 'Podatki', '')
        ].forEach(function (w) { md.appendChild(w); });

        var popr = document.getElementById('poprawka');
        popr.href = popr.getAttribute('href') + '?temat=' + encodeURIComponent('Poprawka w katalogu: ' + m.nazwa) + '&marka=' + encodeURIComponent(m.slug);
        if (window.PNP && window.PNP.sierotki) { window.PNP.sierotki(wrap); window.PNP.sierotki(h1.parentNode); }
        wrap.hidden = false;
      })
      .catch(function () {
        h1.textContent = 'Etykieta chwilowo niedostępna';
        brak.querySelector('p').textContent = 'Nie udało się wczytać danych katalogu. Odśwież stronę za chwilę.';
        brak.hidden = false;
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
