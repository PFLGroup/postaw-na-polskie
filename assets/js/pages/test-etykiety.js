/* Postaw na Polskie — test etykiety (/jak-rozpoznac).
   Bez JS: każde pytanie ma odpowiedź w <details>. Z JS: Prawda/Fałsz, wyjaśnienie po odpowiedzi,
   kolejne pytanie pokazuje się po przejściu dalej. Nic nie jest zapisywane ani wysyłane. */
(function () {
  'use strict';

  var KOMENTARZ = function (wynik, ile) {
    if (wynik === ile) return 'Etykiety nie mają przed Tobą tajemnic.';
    if (wynik >= 3) return 'Dobrze. Zapamiętaj zwłaszcza pytanie o 590.';
    return 'Nie Ty jeden. Większość z nas uczy się tego dopiero teraz.';
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function init(lista) {
    var pytania = Array.prototype.slice.call(lista.querySelectorAll('.t-test__pyt'));
    var wynikBox = lista.parentNode.querySelector('[data-test-wynik]');
    if (!pytania.length) return;
    var punkty = 0;

    pytania.forEach(function (li, i) {
      var odp = li.getAttribute('data-odp');
      var details = li.querySelector('.t-test__odp');
      var teza = li.querySelector('.t-test__teza');
      if (!details || !teza) return;
      if (!teza.id) teza.id = 'test-teza-' + (i + 1);
      details.hidden = true;

      var wybor = el('div', 't-test__wybor');
      wybor.setAttribute('role', 'group');
      wybor.setAttribute('aria-labelledby', teza.id);
      var info = el('div', 't-test__info');
      info.setAttribute('aria-live', 'polite');

      [['prawda', 'Prawda'], ['falsz', 'Fałsz']].forEach(function (opcja) {
        var b = el('button', 't-test__btn', opcja[1]);
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          if (li.getAttribute('data-odpowiedziano')) return;
          li.setAttribute('data-odpowiedziano', '1');
          wybor.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-disabled', 'true'); });
          b.setAttribute('aria-pressed', 'true');

          var trafione = opcja[0] === odp;
          if (trafione) punkty++;
          info.textContent = '';
          info.appendChild(el('p', 't-test__ocena', (trafione ? 'Dobrze. ' : 'Nie tym razem. ') + 'Twoja odpowiedź: ' + opcja[1] + '.'));
          details.querySelectorAll(':scope > :not(summary)').forEach(function (n) { info.appendChild(n.cloneNode(true)); });

          var dalej = el('button', 't-test__dalej', i < pytania.length - 1 ? 'Następne pytanie' : 'Zobacz wynik');
          dalej.type = 'button';
          dalej.addEventListener('click', function () {
            dalej.remove();
            if (i < pytania.length - 1) {
              pytania[i + 1].hidden = false;
              pytania[i + 1].querySelector('.t-test__teza').focus();
            } else {
              pokazWynik();
            }
          });
          info.appendChild(dalej);
        });
        wybor.appendChild(b);
      });

      li.insertBefore(wybor, details);
      li.insertBefore(info, details);
      if (i > 0) li.hidden = true;
    });

    function pokazWynik() {
      if (!wynikBox) return;
      wynikBox.textContent = '';
      wynikBox.appendChild(el('p', 'etykieta__tytul', punkty + '/' + pytania.length));
      wynikBox.appendChild(el('p', 'h-l', KOMENTARZ(punkty, pytania.length)));
      var akcje = el('div', 't-akcje');
      var link = el('a', 'cta', 'Zobacz polskie marki');
      link.href = '../katalog/index.html';
      var znowu = el('button', 't-test__dalej', 'Zacznij od nowa');
      znowu.type = 'button';
      znowu.addEventListener('click', reset);
      akcje.appendChild(link);
      akcje.appendChild(znowu);
      wynikBox.appendChild(akcje);
      wynikBox.hidden = false;
      wynikBox.focus();
    }

    function reset() {
      punkty = 0;
      pytania.forEach(function (li, i) {
        li.removeAttribute('data-odpowiedziano');
        li.hidden = i > 0;
        var info = li.querySelector('.t-test__info');
        if (info) info.textContent = '';
        li.querySelectorAll('.t-test__btn').forEach(function (b) {
          b.removeAttribute('aria-disabled');
          b.setAttribute('aria-pressed', 'false');
        });
      });
      if (wynikBox) { wynikBox.hidden = true; wynikBox.textContent = ''; }
      pytania[0].querySelector('.t-test__teza').focus();
    }
  }

  function start() {
    document.querySelectorAll('[data-test]').forEach(init);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
