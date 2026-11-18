/* Postaw na Polskie — wspólny skrypt wszystkich stron.
   protect() (procedura PFL), menu, rok w stopce, sierotki, formularze statyczne.
   Skrypty podstron → assets/js/pages/<strona>.js (ładowane osobno, defer). */
(function () {
  'use strict';

  var ALLOW = ['postawnapolskie.pl', 'www.postawnapolskie.pl', 'pflgroup.github.io', 'localhost', '127.0.0.1', ''];

  function protect() {
    var h = location.hostname;
    if (ALLOW.indexOf(h) === -1 && !/\.claude\.ai$|\.claudeusercontent\.com$/.test(h)) {
      document.documentElement.innerHTML = '';
      location.replace('https://www.pflgroup.pl');
      return false;
    }
    var editable = function (el) {
      return el && el.closest && el.closest('input, textarea, select, [contenteditable]');
    };
    document.addEventListener('contextmenu', function (e) { if (!editable(e.target)) e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });
    ['copy', 'cut'].forEach(function (t) {
      document.addEventListener(t, function (e) { if (!editable(e.target)) e.preventDefault(); });
    });
    document.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase();
      var mod = e.ctrlKey || e.metaKey;
      if (k === 'f12' || (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) || (mod && (k === 'u' || k === 's'))) {
        e.preventDefault();
      }
    });
    return true;
  }

  // Twarde spacje po jednoliterowych spójnikach/przyimkach (sierotki).
  function sierotki(root) {
    var re = /(^|[\s(„])([aiouwzAIOUWZ]|na|do|od|po|we|ze|że|to|nie|się)\s+/g;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        return /SCRIPT|STYLE|TEXTAREA|INPUT|CODE|PRE/.test(p) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) {
      // dwa przebiegi: przy sąsiednich krótkich słowach („a w domu”) pierwszy zjada spację przed drugim
      if (re.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(re, '$1$2 ').replace(re, '$1$2 ');
      re.lastIndex = 0;
    }
  }

  function menu() {
    var dlg = document.getElementById('menu');
    if (!dlg || !dlg.showModal) return;
    document.querySelectorAll('[data-menu-open]').forEach(function (b) {
      b.addEventListener('click', function () { dlg.showModal(); b.setAttribute('aria-expanded', 'true'); });
    });
    dlg.addEventListener('close', function () {
      document.querySelectorAll('[data-menu-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    });
    dlg.querySelectorAll('[data-menu-close], a').forEach(function (el) {
      el.addEventListener('click', function () { dlg.close(); });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    // aria-current wg ścieżki
    var here = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    dlg.querySelectorAll('a[href]').forEach(function (a) {
      var p = new URL(a.href, location.href).pathname.replace(/index\.html$/, '').replace(/\/$/, '');
      if (p === here) a.setAttribute('aria-current', 'page');
    });
  }

  // Formularze statyczne: walidacja natywna + przejście do strony podziękowania.
  // Docelowy endpoint ustawia klient w atrybucie data-endpoint (np. Formspree / własne API).
  function forms() {
    document.querySelectorAll('form[data-pnp-form]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!f.checkValidity()) { f.reportValidity(); return; }
        var endpoint = f.getAttribute('data-endpoint');
        var next = f.getAttribute('data-thanks') || f.getAttribute('action');
        var go = function () { if (next) location.href = next; };
        if (!endpoint) { go(); return; }
        fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
          .then(go, function () {
            var err = f.querySelector('[data-form-error]');
            if (err) { err.hidden = false; err.focus && err.focus(); }
          });
      });
    });
  }

  if (!protect()) return;
  document.documentElement.classList.add('js');
  window.PNP = { sierotki: sierotki };
  document.addEventListener('DOMContentLoaded', function () {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
    sierotki(document.body);
    menu();
    forms();
  });
})();
