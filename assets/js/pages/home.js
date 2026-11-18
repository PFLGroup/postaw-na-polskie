// Strona główna: etykieta (signature + stempel 6/6), kalkulator, test, półka.
(function () {
 'use strict';
 var d = document;
 d.documentElement.classList.add('js-home');
 var $ = function (s, r) { return (r || d).querySelector(s); };
 var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
 var zl = function (n) { return Math.round(n).toLocaleString('pl-PL') + ' zł'; };

 // etykieta: druk wierszy; 6/6 = jeden moment druku (stempel)
 var etk = $('#etk'), rows = $$('.etk__w'), licznik = $('[data-etk-licznik]'), kreski = $$('.etk-pasek__kod i'), pasek = $('.etk-pasek');
 var input = $('#kupujacy'), kto = $('[data-stempel-kto]');
 var row = function (k) { return $('[data-etk-w="' + k + '"]'); };
 function druk(r) {
  if (!r || r.classList.contains('is-druk')) return;
  r.classList.add('is-druk');
  var k = kreski[rows.indexOf(r)];
  if (k) k.classList.add('is-druk');
  var n = $$('.etk__w.is-druk').length;
  if (licznik) licznik.textContent = n;
  if (n === rows.length && etk) { etk.classList.add('is-pelna'); if (pasek) pasek.classList.add('is-pelna'); }
 }
 function aktywny(r) {
  $$('.etk__k[aria-current]').forEach(function (a) { a.removeAttribute('aria-current'); });
  var a = r && $('a.etk__k', r);
  if (a) a.setAttribute('aria-current', 'location');
 }
 if (input && kto) input.addEventListener('input', function () {
  kto.textContent = input.value.trim() || 'przez Ciebie';
  druk(row('kupujacy'));
 });
 if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (es) {
   es.forEach(function (e) {
    if (!e.isIntersecting) return;
    var r = row(e.target.getAttribute('data-etk'));
    druk(r); aktywny(r);
   });
  }, { rootMargin: '-40% 0px -45% 0px' });
  $$('[data-etk]').forEach(function (s) { io.observe(s); });
  var rdzen = $('.rdzen');
  if (pasek && rdzen) new IntersectionObserver(function (es) {
   pasek.classList.toggle('is-widoczny', es[0].isIntersecting);
  }).observe(rdzen);
 } else rows.forEach(druk);

 // mobile: arkusz
 var dlg = $('#etk-arkusz'), dom = etk && etk.parentNode, wide = matchMedia('(min-width: 1024px)');
 function otworz(focus) {
  if (wide.matches || !dlg || !dlg.showModal) { if (focus && input) input.focus(); return; }
  dlg.appendChild(etk); dlg.showModal();
  if (focus && input) input.focus();
 }
 if (dlg) {
  dlg.addEventListener('close', function () { dom.appendChild(etk); });
  $('[data-etk-close]', dlg).addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) {
   if (e.target === dlg && e.clientY < dlg.getBoundingClientRect().top || e.target.closest('a.etk__k, a.link-dalej')) dlg.close();
  });
  wide.addEventListener && wide.addEventListener('change', function () { if (dlg.open) dlg.close(); });
 }
 $$('[data-etk-open]').forEach(function (b) {
  b.addEventListener('click', function (e) {
   e.preventDefault();
   otworz(b.tagName === 'A');
  });
 });

 // kalkulator: 79 gr − 25 gr = 54 gr z przesuniętej złotówki (Grant Thornton, dane z 2019 r.)
 var f = $('#kalk');
 if (f) {
  f.hidden = false;
  var kw = $('#kwota'), kws = $('#kwota-s'), ud = $('#udzial'), udo = $('#udzial-o');
  var w = function (k, v) { $$('[data-w="' + k + '"]', f).forEach(function (el) { el.textContent = v; }); };
  kws.addEventListener('input', function () { kw.value = kws.value; });
  kw.addEventListener('input', function () { kws.value = kw.value; });
  ud.addEventListener('input', function () { udo.textContent = ud.value + '%'; });
  var licz = function () {
   var k = Math.max(0, Math.min(100000, +kw.value || 0)), u = Math.max(0, Math.min(100, +ud.value || 0));
   var pp = Math.min(10, 100 - u), x = k * pp / 100, y = x * 12, z = y * 0.54;
   w('pp', pp); w('teraz', zl(k * u / 100)); w('po', zl(k * u / 100 + x));
   w('x', zl(x)); w('x2', zl(x)); w('y', zl(y)); w('z', zl(z));
   var t = $('#etk-zostaje');
   if (t) t.textContent = 'ok. ' + zl(z) + ' rocznie więcej*';
   var g = $('.etk__gwiazdka');
   if (g) g.textContent = '* szacunek dla ' + zl(k) + ' miesięcznie (Grant Thornton, dane z 2019 r.).';
  };
  f.addEventListener('submit', function (e) {
   e.preventDefault(); licz();
   druk(row('zostaje'));
  });
  licz();
 }

 // test etykiety
 var pyt = $$('.test__p'), wynik = $('[data-test-wynik]'), ok = 0, odp = 0;
 pyt.forEach(function (p) {
  var box = $('.test__przyciski', p);
  box.hidden = false;
  $$('button', box).forEach(function (b) {
   b.setAttribute('aria-pressed', 'false');
   b.addEventListener('click', function () {
    var dobrze = b.getAttribute('data-o') === p.getAttribute('data-odp');
    $$('button', box).forEach(function (x) { x.disabled = true; });
    b.setAttribute('aria-pressed', 'true');
    var v = d.createElement('p');
    v.className = 'test__werdykt';
    v.textContent = dobrze ? 'Dobrze.' : 'Nie tym razem.';
    box.after(v);
    $('details', p).open = true;
    ok += dobrze; odp++;
    if (odp === pyt.length && wynik) {
     wynik.hidden = false;
     wynik.textContent = ok + '/5. ' + (ok === 5 ? 'Etykiety nie mają przed Tobą tajemnic.' : ok >= 3 ? 'Dobrze. Zapamiętaj zwłaszcza pytanie o 590.' : 'Nie Ty jeden. Większość z nas uczy się tego dopiero teraz.');
    }
   });
  });
 });

 // półka: do 6 marek z faktem i źródłem (filtr po polach, nie po nazwach)
 var polka = $('#polka'), url = /^https?:\/\//;
 var el = function (tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
 if (polka && window.fetch) fetch('data/marki.json').then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (a) {
  a = (Array.isArray(a) ? a : []).filter(function (m) { return m && m.slug && m.nazwa && m.fakt && url.test(m.zrodlo_url || '') && !/odrzuc|ukryt/i.test(m.status || ''); }).slice(0, 6);
  if (a.length < 4) return;
  polka.textContent = '';
  a.forEach(function (m) {
   var li = el('li', 'mini'), h = el('h3'), ln = el('a', null, m.nazwa), dl = el('dl', 'wiersze');
   ln.href = 'katalog/marka/index.html?m=' + encodeURIComponent(m.slug);
   h.appendChild(ln); li.appendChild(h);
   [['Kategoria', m.kategoria], ['Siedziba', [m.miasto, m.wojewodztwo].filter(Boolean).join(', ')]].forEach(function (p) {
    if (!p[1]) return;
    var wr = el('div', 'wiersz'); wr.appendChild(el('dt', null, p[0])); wr.appendChild(el('dd', null, p[1])); dl.appendChild(wr);
   });
   li.appendChild(dl);
   li.appendChild(el('p', 'mini__fakt', m.fakt));
   var z = el('p', 'zrodlo', 'Źródło: '), za = el('a', null, m.zrodlo_url.replace(url, '').replace(/^www\./, '').split('/')[0]);
   za.href = m.zrodlo_url; za.target = '_blank'; za.rel = 'noopener';
   z.appendChild(za);
   if (m.rok_danych) z.appendChild(d.createTextNode(', dane z ' + m.rok_danych + ' r.'));
   li.appendChild(z);
   polka.appendChild(li);
  });
  if (window.PNP && window.PNP.sierotki) window.PNP.sierotki(polka);
 }).catch(function () { /* zostaje stan „Pierwsza półka w budowie” */ });
})();
