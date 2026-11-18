/* Postaw na Polskie — /katalog: półka marek z filtrem (kategoria, województwo, nazwa).
   Dane: data/marki.json. Bez bibliotek. Bez animacji. */
(function () {
  'use strict';

  var WOJ = ['dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie', 'łódzkie', 'małopolskie', 'mazowieckie',
    'opolskie', 'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie', 'świętokrzyskie', 'warmińsko-mazurskie',
    'wielkopolskie', 'zachodniopomorskie'];
  var KAPITAL = {
    'polski-spoldzielczy': 'polski (spółdzielczy)'
  };
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

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
  }

  function liczba(n) {
    if (n === 1) return '1 marka';
    var d = n % 10, s = n % 100;
    return n + (d >= 2 && d <= 4 && (s < 12 || s > 14) ? ' marki' : ' marek');
  }

  // Metryczka S/P/K/T: pokazujemy to, co wiemy z researchu; pole nieznane = „—” (legenda raz, w nagłówku strony).
  function pole(lit, nazwa, wartosc, zrodlo) {
    var dd = el('dd');
    if (wartosc) {
      dd.appendChild(document.createTextNode(wartosc));
      if (zrodlo) dd.appendChild(el('small', { text: 'wg ' + zrodlo }));
    } else {
      dd.className = 'metr__brak';
      dd.appendChild(el('span', { 'aria-hidden': 'true', text: '—' }));
      dd.appendChild(el('span', { class: 'sr-only', text: 'w weryfikacji' }));
    }
    return el('div', null, [el('dt', null, [el('b', { 'aria-hidden': 'true', text: lit }), el('span', { class: 'sr-only', text: nazwa })]), dd]);
  }

  function zrodloKrotkie(m) {
    if (!m.zrodlo_nazwa) return '';
    return m.zrodlo_nazwa.split(':')[0];
  }

  function metr(m) {
    return el('dl', { class: 'metr', 'aria-label': 'Metryczka' }, [
      pole('S', 'Siedziba', m.miasto || ''),
      pole('P', 'Produkcja', ''),
      pole('K', 'Kapitał', kapital(m.kapital), zrodloKrotkie(m)),
      pole('T', 'Podatki', '')
    ]);
  }

  function karta(m) {
    // szerokość etykiety: z długości nazwy, ale tak, by fakt i właściciel nie łamały się co słowo
    var dl = Math.round(Math.max(m.nazwa.length, (m.fakt || '').length / 2.6, (m.wlasciciel || '').length / 3.4));
    var krotka = m.nazwa.length <= 6;
    var fakt = null;
    if (m.fakt) {
      fakt = el('p', { class: 'karta__fakt' }, [m.fakt]);
      if (m.zrodlo_nazwa) fakt.appendChild(el('small', { text: 'Źródło: ' + m.zrodlo_nazwa }));
    }
    var art = el('article', { class: 'karta' + (krotka ? ' karta--krotka' : '') }, [
      el('p', { class: 'dane karta__kat', text: m.kategoria }),
      el('h3', { class: 'karta__nazwa' }, [el('a', { href: 'marka/index.html?m=' + encodeURIComponent(m.slug), text: m.nazwa })]),
      el('p', { class: 'karta__wl', text: m.wlasciciel || '' }),
      metr(m),
      fakt
    ]);
    // szerokość karty zależy od długości nazwy: długie nazwy dostają szerszą etykietę
    var li = el('li', { style: '--dl:' + Math.min(dl, 40) }, [art]);
    if (dl <= 12) li.className = 'polka__waska';
    return li;
  }

  function opcje(select, wartosci, liczniki) {
    wartosci.forEach(function (v) {
      var o = el('option', { value: v, text: v + ' (' + (liczniki[v] || 0) + ')' });
      select.appendChild(o);
    });
  }

  function start() {
    var polka = document.getElementById('polka');
    if (!polka) return;
    var form = document.getElementById('filtr');
    var licznik = document.getElementById('licznik');
    var pusto = document.getElementById('pusto');
    var bladDanych = document.getElementById('blad-danych');
    var fQ = document.getElementById('f-szukaj');
    var fK = document.getElementById('f-kategoria');
    var fW = document.getElementById('f-woj');
    var dane = [];

    function pokaz() {
      var q = norm(fQ.value.trim()), k = fK.value, w = fW.value;
      var wynik = dane.filter(function (m) {
        if (k && m.kategoria !== k) return false;
        if (w && m.wojewodztwo !== w) return false;
        if (q && norm(m.nazwa + ' ' + (m.wlasciciel || '')).indexOf(q) === -1) return false;
        return true;
      });
      polka.textContent = '';
      wynik.forEach(function (m) { polka.appendChild(karta(m)); });
      if (window.PNP && window.PNP.sierotki) window.PNP.sierotki(polka);
      pusto.hidden = wynik.length > 0;
      licznik.textContent = 'Na półce: ' + liczba(wynik.length) + (wynik.length !== dane.length ? ' z ' + dane.length : '') + '.';
      // stan filtra w adresie, żeby dało się go udostępnić
      var p = new URLSearchParams();
      if (k) p.set('k', k); if (w) p.set('w', w); if (fQ.value.trim()) p.set('q', fQ.value.trim());
      var s = p.toString();
      try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch (e) { /* file:// */ }
    }

    fetch(polka.getAttribute('data-zrodlo'))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (json) {
        dane = json.slice().sort(function (a, b) { return a.nazwa.localeCompare(b.nazwa, 'pl'); });
        var lk = {}, lw = {};
        dane.forEach(function (m) {
          lk[m.kategoria] = (lk[m.kategoria] || 0) + 1;
          if (m.wojewodztwo) lw[m.wojewodztwo] = (lw[m.wojewodztwo] || 0) + 1;
        });
        opcje(fK, Object.keys(lk).sort(function (a, b) { return a.localeCompare(b, 'pl'); }), lk);
        opcje(fW, WOJ, lw);
        var p = new URLSearchParams(location.search);
        if (p.get('k') && lk[p.get('k')]) fK.value = p.get('k');
        if (p.get('w') && WOJ.indexOf(p.get('w')) > -1) fW.value = p.get('w');
        if (p.get('q')) fQ.value = p.get('q');
        form.hidden = false;
        pokaz();
      })
      .catch(function () {
        licznik.textContent = 'Katalog chwilowo niedostępny.';
        bladDanych.hidden = false;
      });

    var t;
    fQ.addEventListener('input', function () { clearTimeout(t); t = setTimeout(pokaz, 200); });
    fK.addEventListener('change', pokaz);
    fW.addEventListener('change', pokaz);
    form.addEventListener('submit', function (e) { e.preventDefault(); pokaz(); });
    form.addEventListener('reset', function () { setTimeout(pokaz, 0); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
