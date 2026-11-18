// Etykieta → PNG (canvas, lokalnie). Kolory stałe: tusz na papierze.
(function () {
 'use strict';
 var d = document, b = d.querySelector('[data-etk-png]');
 if (!b || !d.createElement('canvas').getContext) return;
 b.hidden = false;
 var T = '#ac0311', P = '#fef9f7', K = '#2c1a18', DISP = '"Poltawski Nowy", Georgia, serif', TXT = 'Lato, "Segoe UI", sans-serif';

 b.addEventListener('click', function () {
  var f = d.fonts, go = function () { rysuj(); };
  if (!f) return go();
  Promise.all([f.load('700 120px "Poltawski Nowy"'), f.load('400 30px Lato'), f.load('700 30px Lato'), f.load('900 30px Lato')])
   .then(function () { return f.ready; }).then(go, go);
 });

 function dopasuj(x, txt, font, size, max) {
  do { x.font = font.replace('#', size); size -= 2; } while (x.measureText(txt).width > max && size > 20);
 }
 function zawin(x, txt, max) {
  var w = txt.split(' '), l = [], cur = '';
  w.forEach(function (s) { var t = cur ? cur + ' ' + s : s; if (x.measureText(t).width > max && cur) { l.push(cur); cur = s; } else cur = t; });
  if (cur) l.push(cur);
  return l;
 }

 function rysuj() {
  var W = 1080, H = 1350, M = 96, c = d.createElement('canvas'), x = c.getContext('2d');
  c.width = W; c.height = H;
  x.fillStyle = P; x.fillRect(0, 0, W, H);
  x.strokeStyle = T; x.lineWidth = 6; x.strokeRect(48, 48, W - 96, H - 96);
  x.fillStyle = T; x.textBaseline = 'alphabetic';

  x.font = '700 24px ' + TXT; x.fillText('MOJA ETYKIETA  ·  KAMPANIA SPOŁECZNA', M, 132);
  dopasuj(x, 'na Polskie.', '700 #px ' + DISP, 150, W - 2 * M);
  x.fillText('Postaw', M, 280); x.fillText('na Polskie.', M, 410);

  x.font = '700 56px ' + DISP;
  var pw = x.measureText('Niech zostanie tutaj.').width + 36;
  x.fillRect(M, 440, pw, 84); x.fillStyle = P; x.fillText('Niech zostanie tutaj.', M + 18, 500);
  x.fillStyle = T; x.fillRect(M, 556, W - 2 * M, 8);

  var y = 610, kx = M, vx = M + 330, vw = W - M - vx;
  d.querySelectorAll('.etk__w:not(.etk__w--kupujacy)').forEach(function (r) {
   var k = r.querySelector('.etk__k').textContent.trim(), v = r.querySelector('.etk__v').textContent.trim().replace(/\*$/, '');
   x.font = '400 30px ' + TXT;
   var l = zawin(x, v, vw);
   x.font = '700 30px ' + TXT; x.fillText(k, kx, y);
   x.font = '400 30px ' + TXT; l.forEach(function (s, i) { x.fillText(s, vx, y + i * 38); });
   y += 38 * l.length + 18;
   x.fillRect(M, y - 34, W - 2 * M, 2);
   y += 18;
  });

  var inp = d.getElementById('kupujacy'), kto = ((inp && inp.value) || '').trim().slice(0, 28);
  y += 30;
  x.font = '700 30px ' + TXT; x.fillText('Kupujący', kx, y);
  if (kto) { dopasuj(x, kto, '700 #px ' + DISP, 72, vw); x.fillText(kto, vx, y + 6); }
  x.fillRect(M, y + 34, W - 2 * M, 10);

  // stempel „SPRAWDZONE · kto” (tylko gdy etykieta osiągnęła 6/6)
  var e = d.getElementById('etk');
  if (e && e.classList.contains('is-pelna')) {
   var sw = 330, sh = 128;
   x.save(); x.translate(800, 196); x.rotate(-6 * Math.PI / 180);
   x.lineWidth = 5; x.strokeRect(-sw / 2, -sh / 2, sw, sh);
   x.lineWidth = 2; x.strokeRect(-sw / 2 + 10, -sh / 2 + 10, sw - 20, sh - 20);
   x.textAlign = 'center'; x.font = '900 40px ' + TXT; x.fillText('SPRAWDZONE', 0, -6);
   dopasuj(x, (kto || 'przez Ciebie').toLocaleUpperCase('pl'), '900 #px ' + TXT, 30, sw - 56);
   x.fillText((kto || 'przez Ciebie').toLocaleUpperCase('pl'), 0, 36);
   x.restore();
  }

  // stopka: kod kreskowy (czerń) + adres
  x.fillStyle = K;
  var bx = M, wz = [3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 4, 2, 1, 2, 3, 1, 2];
  wz.forEach(function (s, i) { if (i % 2 === 0) x.fillRect(bx, H - 200, s * 4, 90); bx += s * 4 + 2; });
  x.fillStyle = T; x.textAlign = 'right';
  x.font = '700 34px ' + TXT; x.fillText('postawnapolskie.pl', W - M, H - 150);
  x.font = '400 26px ' + TXT; x.fillText('#PostawNaPolskie', W - M, H - 112);

  c.toBlob(function (bl) {
   if (!bl) return;
   var a = d.createElement('a'), u = URL.createObjectURL(bl);
   a.href = u; a.download = 'moja-etykieta-postaw-na-polskie.png';
   d.body.appendChild(a); a.click(); a.remove();
   setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
  }, 'image/png');
 }
})();
