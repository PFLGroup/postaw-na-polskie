/* v2-B: motyw, kalkulator-infografika, przypisy na marginesie */
(function () {
  var d = document, root = d.documentElement;
  var zl = function (n) { return Math.round(n).toLocaleString('pl-PL') + ' zł'; };

  var bt = d.querySelector('[data-motyw]');
  if (bt) bt.addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('pnp-theme', root.dataset.theme); } catch (e) {}
  });

  var k = d.getElementById('kwota'), ks = d.getElementById('kwota-s'), u = d.getElementById('udzial'), uo = d.getElementById('udzial-o');
  var pPl = d.querySelector('[data-pasek="pl"]'), pPlus = d.querySelector('[data-pasek="plus"]');
  function put(w, v) { d.querySelectorAll('[data-w="' + w + '"]').forEach(function (el) { el.textContent = v; }); }
  function licz() {
    var kw = Math.max(0, +k.value || 0), ud = +u.value, pp = Math.min(10, 100 - ud), x = kw * pp / 100, teraz = kw * ud / 100;
    uo.textContent = ud + '%';
    put('pp', pp); put('x', zl(x)); put('teraz', zl(teraz)); put('z', zl(x * 12 * 0.54));
    pPl.style.width = ud + '%'; pPlus.style.width = pp + '%';
  }
  if (k) {
    ks.addEventListener('input', function () { k.value = ks.value; licz(); });
    k.addEventListener('input', function () { ks.value = Math.min(10000, +k.value || 0); licz(); });
    u.addEventListener('input', licz);
    d.getElementById('kalk').addEventListener('submit', function (e) { e.preventDefault(); });
    licz();
  }

  // przypisy: klik/tap rozwija (mobile) i podświetla notę na marginesie (desktop); hover też podświetla
  d.querySelectorAll('.przyp').forEach(function (b) {
    var n = d.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', on);
      n.classList.toggle('on', on);
    });
    b.addEventListener('mouseenter', function () { n.classList.add('on'); });
    b.addEventListener('mouseleave', function () { if (b.getAttribute('aria-expanded') !== 'true') n.classList.remove('on'); });
  });
})();
