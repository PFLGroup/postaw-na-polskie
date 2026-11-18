/* v2-C: motyw, mapa adresów (signature), kalkulator */
(function () {
  var d = document, root = d.documentElement;
  var zl = function (n) { return Math.round(n).toLocaleString('pl-PL') + ' zł'; };
  var cichy = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bt = d.querySelector('[data-motyw]');
  if (bt) bt.addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('pnp-theme', root.dataset.theme); } catch (e) {}
  });

  // mapa: punkt -> karta z metryczką
  var firmy = JSON.parse(d.getElementById('firmy').textContent), byId = {};
  firmy.forEach(function (f) { byId[f.id] = f; });
  var karta = d.getElementById('karta'), pins = d.querySelectorAll('.pin');
  function pokaz(id) {
    var f = byId[id]; if (!f) return;
    pins.forEach(function (p) { p.classList.toggle('on', p.dataset.id === id); p.setAttribute('aria-pressed', p.dataset.id === id); });
    var wypelnij = function () {
      var v = { miasto: f.miasto, nazwa: f.nazwa, marki: f.marki, siedziba: f.miasto, kapital: f.kapital, fakt: f.fakt, zrodlo: f.zrodlo };
      karta.querySelectorAll('[data-k]').forEach(function (el) { el.textContent = v[el.dataset.k]; });
      karta.classList.remove('zmiana');
    };
    if (cichy) wypelnij(); else { karta.classList.add('zmiana'); setTimeout(wypelnij, 160); }
  }
  pins.forEach(function (p) {
    p.addEventListener('click', function () { pokaz(p.dataset.id); });
    p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pokaz(p.dataset.id); } });
  });
  d.querySelectorAll('[data-pokaz]').forEach(function (b) {
    b.addEventListener('click', function () {
      pokaz(b.dataset.pokaz);
      d.getElementById('mapa').scrollIntoView({ behavior: cichy ? 'auto' : 'smooth' });
    });
  });
  pins.length && pins[0].classList.add('on');

  // kalkulator
  var k = d.getElementById('kwota'), ks = d.getElementById('kwota-s'), u = d.getElementById('udzial'), uo = d.getElementById('udzial-o');
  function put(w, v) { d.querySelectorAll('[data-w="' + w + '"]').forEach(function (el) { el.textContent = v; }); }
  function licz() {
    var kw = Math.max(0, +k.value || 0), ud = +u.value, pp = Math.min(10, 100 - ud), x = kw * pp / 100;
    uo.textContent = ud + '%'; put('pp', pp); put('x', zl(x)); put('z', zl(x * 12 * 0.54));
  }
  ks.addEventListener('input', function () { k.value = ks.value; licz(); });
  k.addEventListener('input', function () { ks.value = Math.min(10000, +k.value || 0); licz(); });
  u.addEventListener('input', licz);
  d.getElementById('kalk').addEventListener('submit', function (e) { e.preventDefault(); });
  licz();
})();
