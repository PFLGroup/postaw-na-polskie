/* Postaw na Polskie — formularze firm (/zglos-firme, /dla-firm).
   1) Walidacja NIP (suma kontrolna), e-maila, zgód i rozmiaru pliku: komunikaty prostym językiem.
   2) Formularz krokowy [data-kroki]: bez JS wszystkie kroki są widoczne jako fieldsety.
   Wysyłkę i przejście na stronę podziękowania robi main.js (data-pnp-form).
   Ten skrypt rejestruje „submit” przed main.js (defer, przed DOMContentLoaded), więc może zatrzymać wysyłkę w środku kroków. */
(function () {
  'use strict';

  var MSG = {
    nipDlugosc: 'NIP ma 10 cyfr. Wpisz go bez kresek.',
    nipSuma: 'Ten NIP ma błędną cyfrę kontrolną. Sprawdź, czy nie ma literówki.',
    email: 'Ten adres wygląda na niepełny. Sprawdź, czy jest w nim @ i domena.',
    zgoda: 'Bez tej zgody nie możemy przyjąć zgłoszenia.',
    plik: 'Plik jest większy niż 5 MB. Wybierz mniejszy albo pomiń załącznik.',
    plikTyp: 'Załącznik musi być plikiem PDF.'
  };

  function nipPoprawny(nip) {
    if (!/^\d{10}$/.test(nip)) return false;
    var w = [6, 5, 7, 2, 3, 4, 5, 6, 7], s = 0;
    for (var i = 0; i < 9; i++) s += w[i] * +nip.charAt(i);
    var k = s % 11;
    return k !== 10 && k === +nip.charAt(9);
  }

  function polebled(input, tekst) {
    var ids = (input.getAttribute('aria-describedby') || '').split(/\s+/);
    var p = null;
    ids.forEach(function (id) { if (/-blad$/.test(id)) p = document.getElementById(id); });
    if (p) { p.textContent = tekst || ''; p.hidden = !tekst; }
    if (tekst) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }

  // ---------- NIP ----------
  document.querySelectorAll('input[data-nip]').forEach(function (inp) {
    var dotkniete = false;
    function sprawdz(pokaz) {
      var v = inp.value.replace(/[\s-]/g, '');
      var msg = '';
      if (v === '') msg = inp.required ? MSG.nipDlugosc : '';
      else if (!/^\d{10}$/.test(v)) msg = MSG.nipDlugosc;
      else if (!nipPoprawny(v)) msg = MSG.nipSuma;
      inp.setCustomValidity(msg);
      if (pokaz) polebled(inp, msg);
      return v;
    }
    inp.removeAttribute('pattern'); // walidację przejmuje JS (pozwala też wkleić NIP z kreskami)
    inp.addEventListener('input', function () { sprawdz(dotkniete); });
    inp.addEventListener('blur', function () {
      dotkniete = true;
      var v = sprawdz(true);
      if (/^\d{10}$/.test(v)) inp.value = v;
    });
    inp.addEventListener('invalid', function () { dotkniete = true; sprawdz(true); });
    sprawdz(false);
  });

  // ---------- e-mail ----------
  document.querySelectorAll('input[data-email]').forEach(function (inp) {
    function sprawdz() {
      inp.setCustomValidity('');
      if (inp.validity.typeMismatch) inp.setCustomValidity(MSG.email);
    }
    inp.addEventListener('input', sprawdz);
    inp.addEventListener('invalid', sprawdz);
  });

  // ---------- zgody wymagane ----------
  document.querySelectorAll('input[data-zgoda]').forEach(function (inp) {
    function sprawdz() { inp.setCustomValidity(inp.checked ? '' : MSG.zgoda); }
    inp.addEventListener('change', sprawdz);
    sprawdz();
  });

  // ---------- plik ----------
  document.querySelectorAll('input[type=file][data-max-mb]').forEach(function (inp) {
    var max = parseFloat(inp.getAttribute('data-max-mb')) * 1024 * 1024;
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0], msg = '';
      if (f && !/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') msg = MSG.plikTyp;
      else if (f && f.size > max) msg = MSG.plik;
      inp.setCustomValidity(msg);
      polebled(inp, msg);
    });
  });

  // ---------- honeypot: boty wypełniają ukryte pole ----------
  document.querySelectorAll('form[data-pnp-form]').forEach(function (f) {
    var hp = f.querySelector('.miodek input');
    if (!hp) return;
    f.addEventListener('submit', function (e) {
      if (hp.value) { e.preventDefault(); e.stopImmediatePropagation(); }
    });
  });

  // ---------- formularz krokowy jako etykieta: każdy krok = wiersz etykiety ----------
  // Wiersze wypełnione pokazują skrót wpisanych danych i przycisk „Zmień”, przyszłe mają „—”.
  // Bieżący krok to rozwinięty wiersz (legend fieldsetu). Bez JS widać wszystkie fieldsety.
  document.querySelectorAll('form[data-kroki]').forEach(function (form) {
    var kroki = Array.prototype.slice.call(form.querySelectorAll('fieldset[data-krok]'));
    if (kroki.length < 2) return;
    var n = kroki.length, biezacy = 0, maks = 0;
    var live = form.querySelector('[data-postep-live]');
    var nav = form.querySelector('[data-krok-nav]');

    form.setAttribute('data-krokowy', '');

    function tytul(k) { var t = kroki[k].querySelector('.krok__tyt'); return t ? t.textContent : ''; }
    function nr(k) { return (k + 1 < 10 ? '0' : '') + (k + 1); }

    function skrot(k) {
      var wart = [];
      kroki[k].querySelectorAll('input, select, textarea').forEach(function (p) {
        if (p.closest('.miodek') || p.type === 'file' || p.type === 'checkbox' || p.type === 'hidden') return;
        if (p.type === 'radio' && !p.checked) return;
        var v = (p.tagName === 'SELECT' ? (p.value ? p.options[p.selectedIndex].text : '') : p.value).trim();
        if (v) wart.push(v);
      });
      var t = wart.slice(0, 3).join(' · ');
      return t.length > 70 ? t.slice(0, 68) + '…' : t;
    }

    // numer kroku w legendzie jak numer wiersza etykiety: „01”, pełny opis dla czytnika ekranu
    kroki.forEach(function (fs, k) {
      var nrEl = fs.querySelector('.krok__nr');
      if (!nrEl) return;
      var pelny = nrEl.textContent;
      nrEl.textContent = '';
      var a = document.createElement('span'); a.setAttribute('aria-hidden', 'true'); a.textContent = nr(k);
      var b = document.createElement('span'); b.className = 'sr-only'; b.textContent = pelny + ': ';
      nrEl.appendChild(a); nrEl.appendChild(b);
    });

    var wiersze = kroki.map(function (fs, k) {
      var w = document.createElement('div');
      w.className = 'krok-wiersz';
      w.innerHTML = '<span class="krok-wiersz__nr"></span><span class="krok-wiersz__tyt"></span><span class="krok-wiersz__v"></span>';
      w.children[0].textContent = nr(k);
      w.children[1].textContent = tytul(k);
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'krok-wiersz__zmien';
      btn.textContent = 'Zmień';
      btn.setAttribute('aria-label', 'Zmień: ' + tytul(k));
      btn.addEventListener('click', function () { pokaz(k, true); });
      w.appendChild(btn);
      fs.parentNode.insertBefore(w, fs);
      return w;
    });

    var wstecz = document.createElement('button');
    wstecz.type = 'button'; wstecz.className = 'cta cta--obrys cta--wstecz'; wstecz.textContent = 'Wstecz';
    var dalej = document.createElement('button');
    dalej.type = 'button'; dalej.className = 'cta'; dalej.textContent = 'Dalej';

    function krokPoprawny(k) {
      var pola = kroki[k].querySelectorAll('input, select, textarea');
      for (var i = 0; i < pola.length; i++) {
        if (!pola[i].checkValidity()) { pola[i].reportValidity(); return false; }
      }
      return true;
    }

    function pokaz(k, fokus) {
      biezacy = k; maks = Math.max(maks, k);
      kroki.forEach(function (fs, i) { fs.hidden = i !== k; });
      wiersze.forEach(function (w, i) {
        var v = w.querySelector('.krok-wiersz__v');
        w.hidden = i === k;
        if (i < maks) { w.setAttribute('data-stan', 'wypelniony'); v.textContent = skrot(i) || 'pominięte'; }
        else if (i === maks) { w.setAttribute('data-stan', 'otwarty'); v.textContent = skrot(i) || '—'; }
        else { w.setAttribute('data-stan', 'pusty'); v.textContent = '—'; }
      });
      // nawigacja zawsze pod bieżącym krokiem, przed kolejnymi pustymi wierszami
      kroki[k].appendChild(nav);
      var opis = 'Wiersz ' + (k + 1) + ' z ' + n + ': ' + tytul(k);
      nav.textContent = '';
      if (k > 0) nav.appendChild(wstecz);
      if (k < n - 1) nav.appendChild(dalej);
      if (fokus) {
        if (live) live.textContent = opis;
        var t = kroki[k].querySelector('.krok__tyt');
        if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
        kroki[k].scrollIntoView({ block: 'nearest' });
      }
    }

    dalej.addEventListener('click', function () { if (krokPoprawny(biezacy)) pokaz(biezacy + 1, true); });
    wstecz.addEventListener('click', function () { pokaz(biezacy - 1, true); });

    form.addEventListener('submit', function (e) {
      if (biezacy < n - 1) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (krokPoprawny(biezacy)) pokaz(biezacy + 1, true);
        return;
      }
      for (var k = 0; k < n; k++) {
        var pola = kroki[k].querySelectorAll('input, select, textarea');
        for (var i = 0; i < pola.length; i++) {
          if (!pola[i].checkValidity()) {
            e.preventDefault(); e.stopImmediatePropagation();
            if (k !== biezacy) pokaz(k, true);
            pola[i].reportValidity();
            return;
          }
        }
      }
    });

    pokaz(0, false);
  });
})();
