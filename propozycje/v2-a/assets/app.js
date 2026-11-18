/* v2-A: motyw, kalkulator, kod złotówki */
(function () {
  var d = document, root = d.documentElement;
  var zl = function (n) { return Math.round(n).toLocaleString('pl-PL') + ' zł'; };

  // motyw
  var bt = d.querySelector('[data-motyw]');
  if (bt) bt.addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('pnp-theme', root.dataset.theme); } catch (e) {}
  });

  // kalkulator: przesuwamy 10 pkt proc. (albo resztę do 100%); różnica 79 gr - 25 gr = 54 gr
  var k = d.getElementById('kwota'), ks = d.getElementById('kwota-s'), u = d.getElementById('udzial'), uo = d.getElementById('udzial-o');
  function put(w, v) { d.querySelectorAll('[data-w="' + w + '"]').forEach(function (el) { el.textContent = v; }); }
  function licz() {
    var kw = Math.max(0, +k.value || 0), ud = +u.value;
    var pp = Math.min(10, 100 - ud), x = kw * pp / 100, teraz = kw * ud / 100;
    uo.textContent = ud + '%';
    put('pp', pp); put('teraz', zl(teraz)); put('po', zl(teraz + x)); put('y', zl(x * 12)); put('z', zl(x * 12 * 0.54));
  }
  if (k) {
    ks.addEventListener('input', function () { k.value = ks.value; licz(); });
    k.addEventListener('input', function () { ks.value = Math.min(10000, +k.value || 0); licz(); });
    u.addEventListener('input', licz);
    d.getElementById('kalk').addEventListener('submit', function (e) { e.preventDefault(); });
    licz();
  }

  // kod złotówki: 100 kresek o stałym, „drukarskim” rytmie szerokości
  var box = d.getElementById('kreski'), liczba = d.getElementById('kod-liczba');
  if (box) {
    var wz = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1];
    var frag = d.createDocumentFragment();
    for (var i = 0; i < 100; i++) {
      var b = d.createElement('i');
      b.style.width = wz[i % wz.length] + 'px';
      b.style.setProperty('--i', i);
      frag.appendChild(b);
    }
    box.appendChild(frag);
    var bars = box.children;
    function ustaw(n) {
      for (var j = 0; j < 100; j++) bars[j].classList.toggle('on', j < n);
      liczba.textContent = n;
    }
    ustaw(79);
    d.querySelectorAll('[data-kod]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        d.querySelectorAll('[data-kod]').forEach(function (o) { o.setAttribute('aria-checked', o === btn); });
        ustaw(+btn.dataset.kod);
      });
    });
  }
})();
