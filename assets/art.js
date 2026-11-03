/* 2zer011-slide art layer: themed animated SVG backgrounds (eg / cn / in / dark). ES5, no ids/defs (display:none safe). */
(function (d) {
  var H = '<svg class="bgart" width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">';
  function R(n, f) { var s = '', i; for (i = 0; i < n; i++) s += f(i); return s; }
  function g(c, o, w, body, extra) { return '<g fill="none" stroke="' + c + '" stroke-opacity="' + o + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" ' + (extra || '') + '>' + body + '</g>'; }
  function f(c, o, body, extra) { return '<g fill="' + c + '" fill-opacity="' + o + '" ' + (extra || '') + '>' + body + '</g>'; }
  function rnd(i, m, a) { return (i * 97 + a) % m; }
  function wave(y, len) { return 'M0 ' + y + ' q16 -10 32 0' + R(len / 32, function () { return ' t32 0'; }); }

  function mf(c) { var G = ['π', '√', '∑', '∞', '0', '1', '2', '3', '+', '×', '÷', '=']; return f(c, .28, R(14, function (i) { return '<text x="' + (70 + rnd(i, 1130, 43)) + '" y="700" font-size="' + (26 + i % 4 * 8) + '" font-family="Georgia,serif" class="rise" style="animation-delay:-' + (i * 1.7) + 's;animation-duration:' + (14 + i % 5 * 3) + 's">' + G[i % 12] + '</text>'; })); }
  function eg() {
    var c = '#7a4a12', s = H;
    s += g(c, .3, 2, R(46, function (i) { return '<path d="M' + (i * 28) + ' 40L' + (i * 28 + 14) + ' 26L' + (i * 28 + 28) + ' 40"/>'; }) +
      R(46, function (i) { return '<path d="M' + (i * 28) + ' 680L' + (i * 28 + 14) + ' 694L' + (i * 28 + 28) + ' 680"/>'; }));
    /* sun disc + rays */
    s += g('#a3341c', .35, 3, '<circle cx="1120" cy="130" r="40"/><circle cx="1120" cy="130" r="26" stroke-width="2"/>' + R(24, function (i) { return '<path d="M1120 70V84" transform="rotate(' + (i * 15) + ' 1120 130)"/>'; }), 'class="spin" style="transform-origin:1120px 130px"');
    /* pyramids */
    s += f(c, .09, '<path d="M60 640L200 470L340 640Z"/><path d="M250 640L360 520L470 640Z"/>') + g(c, .3, 2, '<path d="M60 640L200 470L340 640Z"/><path d="M200 470V640"/><path d="M250 640L360 520L470 640"/>');
    /* nile waves */
    s += g('#1f7a8c', .3, 3, '<path d="' + wave(612, 1400) + '"/>', 'class="drift"') + g('#1f7a8c', .22, 3, '<path d="' + wave(626, 1400) + '"/>', 'class="drift" style="animation-duration:7s"') + g('#1f7a8c', .16, 3, '<path d="' + wave(640, 1400) + '"/>', 'class="drift" style="animation-duration:9s"');
    /* glyph strip */
    var gl = [
      '<circle cx="8" cy="6" r="6"/><path d="M8 12V32M0 20H16"/>',
      '<path d="M0 12Q14 0 28 12Q14 24 0 12Z"/><circle cx="14" cy="12" r="4"/><path d="M14 24Q8 34 4 32"/>',
      '<path d="M8 0V32M0 6H16M1 13H15M2 20H14"/>',
      '<path d="M10 32Q0 16 10 0Q20 16 10 32Z"/><path d="M10 6V30"/>',
      '<ellipse cx="14" cy="14" rx="10" ry="8"/><path d="M14 6V22M4 8L0 2M24 8L28 2M4 20L0 28M24 20L28 28"/>',
      '<path d="M0 30H20M10 30V0L20 6L10 12"/>'];
    s += g(c, .3, 2.5, R(12, function (i) { return '<g transform="translate(' + (64 + i * 100) + ',650)">' + gl[i % 6] + '</g>'; }));
    /* dust */
    s += f('#d4a437', .6, R(14, function (i) { return '<circle cx="' + (40 + rnd(i, 1200, 31)) + '" cy="' + (200 + rnd(i, 420, 17)) + '" r="' + (2 + i % 3) + '" class="float" style="animation-delay:-' + (i * 0.9) + 's"/>'; }));
    s += mf('#7a4a12'); return s + '</svg>';
  }

  function cn() {
    var c = '#7a2a14', s = H;
    s += g(c, .28, 2.5, R(80, function (i) { return '<path d="M' + (i * 16) + ' 40h12v-10h-8v6h4"/>'; }) + R(80, function (i) { return '<path d="M' + (i * 16) + ' 690h12v-10h-8v6h4"/>'; }));
    s += '<g transform="translate(905,14) scale(1)">' + g(c, .3, 2.2, '<path d="M0 30C0 10 22 10 24 26C26 12 46 12 46 28C62 20 72 42 52 46H8C-8 46 -6 32 0 30Z"/><path d="M14 28C12 20 22 20 20 27"/>', 'class="cloud"') + '</g>';
    s += '<g transform="translate(110,560) scale(1.1)">' + g(c, .25, 2.2, '<path d="M0 30C0 10 22 10 24 26C26 12 46 12 46 28C62 20 72 42 52 46H8C-8 46 -6 32 0 30Z"/><path d="M14 28C12 20 22 20 20 27"/>', 'class="cloud" style="animation-duration:28s"') + '</g>';
    /* mountains in mist */
    s += f(c, .07, '<path d="M0 700L0 600L120 520L200 580L330 480L470 600L560 560L700 650L760 700Z"/>') +
      f(c, .06, '<path d="M520 700L640 600L760 640L900 540L1040 640L1180 560L1280 620L1280 700Z"/>') +
      g(c, .22, 2, '<path d="M0 600L120 520L200 580L330 480L470 600"/><path d="M640 600L760 640L900 540L1040 640L1180 560L1280 620"/>');
    /* bamboo */
    s += g('#2f6a3a', .35, 5, R(3, function (i) { var x = 1214 + i * 22; return '<path d="M' + x + ' 720V420"/>' + R(5, function (j) { return '<path d="M' + (x - 6) + ' ' + (700 - j * 60) + 'h12" stroke-width="3"/>'; }); }), 'class="sway" style="transform-origin:1236px 720px"') +
      f('#2f6a3a', .3, R(6, function (i) { return '<path d="M1214 ' + (460 + i * 36) + 'q-50 -12 -70 -4q40 22 70 4Z"/>'; }), 'class="sway" style="transform-origin:1236px 720px;animation-duration:7s"');
    /* coins */
    s += g(c, .2, 2, R(4, function (i) { var x = 90 + i * 330, y = 640 - (i % 2) * 14; return '<circle cx="' + x + '" cy="' + y + '" r="18"/><rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="10" height="10"/>'; }));
    /* petals */
    s += f('#d98a9a', .55, R(12, function (i) { return '<ellipse cx="' + (60 + rnd(i, 1100, 23)) + '" cy="-20" rx="6" ry="3.5" class="fall" style="animation-delay:-' + (i * 1.4) + 's;animation-duration:' + (13 + i % 4 * 3) + 's"/>'; }));
    /* seal */
    s += '<g transform="translate(1100,636)"><rect width="44" height="44" fill="#a3341c" fill-opacity=".65"/><text x="22" y="29" font-size="17" text-anchor="middle" fill="#fff5d6" font-family="Georgia" font-weight="bold">2011</text></g>';
    s += mf('#7a2a14'); return s + '</svg>';
  }

  function ind() {
    var c = '#6a3e08', s = H;
    s += g(c, .3, 2.5, R(32, function (i) { return '<path d="M' + (i * 40) + ' 44a20 20 0 0 1 40 0"/><circle cx="' + (i * 40 + 20) + '" cy="30" r="2.5"/>'; }) + R(32, function (i) { return '<path d="M' + (i * 40) + ' 676a20 20 0 0 0 40 0"/><circle cx="' + (i * 40 + 20) + '" cy="692" r="2.5"/>'; }));
    function lotus(x, y, r, cl, st) { return '<g transform="translate(' + x + ',' + y + ')">' + g(cl, .3, 2.2, R(12, function (i) { return '<ellipse cx="0" cy="-' + r * .62 + '" rx="' + r * .2 + '" ry="' + r * .38 + '" transform="rotate(' + (i * 30) + ')"/>'; }) + '<circle r="' + r * .3 + '"/><circle r="' + r * 1.05 + '" stroke-dasharray="3 7"/>', st) + '</g>'; }
    s += lotus(64, 690, 62, c, 'class="spin" style="transform-origin:0 0"');
    s += lotus(1216, 690, 62, c, 'class="spinr" style="transform-origin:0 0"');
    s += lotus(1180, 100, 44, '#a3341c', 'class="spin" style="transform-origin:0 0;animation-duration:60s"');
    /* temple arches */
    s += g(c, .22, 2, R(9, function (i) { var x = 280 + i * 80; return '<path d="M' + x + ' 676V630Q' + x + ' 596 ' + (x + 24) + ' 588Q' + (x + 48) + ' 596 ' + (x + 48) + ' 630V676"/><path d="M' + (x + 24) + ' 588V572"/>'; }));
    /* petals (marigold) */
    s += f('#e07a1f', .5, R(12, function (i) { return '<circle cx="' + (60 + rnd(i, 1100, 41)) + '" cy="-20" r="' + (3 + i % 3) + '" class="fall" style="animation-delay:-' + (i * 1.3) + 's;animation-duration:' + (12 + i % 5 * 2) + 's"/>'; }));
    s += f('#d4a437', .6, R(8, function (i) { return '<circle cx="' + (80 + rnd(i, 1100, 13)) + '" cy="' + (300 + rnd(i, 300, 7)) + '" r="2.5" class="float" style="animation-delay:-' + (i * 1.1) + 's"/>'; }));
    s += mf('#6a3e08'); return s + '</svg>';
  }

  function dk() {
    var c = '#c79a3a', s = H;
    s += f('#f5d98a', .8, R(46, function (i) { return '<circle cx="' + (30 + rnd(i, 1220, 53)) + '" cy="' + (30 + rnd(i, 650, 29)) + '" r="' + (1 + i % 3 * .7) + '" class="tw" style="animation-delay:-' + (i % 7 * .5) + 's;animation-duration:' + (2 + i % 4) + 's"/>'; }));
    s += g(c, .2, 2, '<circle cx="640" cy="360" r="340"/><circle cx="640" cy="360" r="300" stroke-dasharray="4 10"/><path d="M640 20L934 530L346 530Z"/><path d="M640 700L346 190L934 190Z"/>', 'class="spin" style="transform-origin:640px 360px"');
    s += g(c, .16, 2, '<circle cx="640" cy="360" r="220"/>' + R(12, function (i) { return '<path d="M640 140V170" transform="rotate(' + (i * 30) + ' 640 360)"/>'; }) + '<path d="M640 140L830 470L450 470Z"/>', 'class="spinr" style="transform-origin:640px 360px"');
    s += f('#d4a437', .6, R(10, function (i) { return '<circle cx="' + (60 + rnd(i, 1150, 61)) + '" cy="' + (400 + rnd(i, 280, 19)) + '" r="2.5" class="float" style="animation-delay:-' + (i * 0.9) + 's"/>'; }));
    s += mf('#f5d98a'); return s + '</svg>';
  }

  var T = { eg: eg, cn: cn, 'in': ind, dark: dk };
  function theme(el) { var c = ' ' + el.className + ' ', k; for (k in T) if (c.indexOf(' ' + k + ' ') > -1) return k; return 'eg'; }
  function run() {
    var s = d.getElementById('stage'), i, e, t, w;
    if (!s) return;
    for (i = 0; i < s.children.length; i++) {
      e = s.children[i];
      if ((' ' + e.className + ' ').indexOf(' slide ') < 0 || e.getAttribute('data-noart')) continue;
      t = theme(e); w = d.createElement('div'); w.innerHTML = T[t]();
      e.insertBefore(w.firstChild, e.firstChild);
      w = d.createElement('div'); w.className = 'glow'; w.innerHTML = '<b></b><i></i><i class="g2"></i><u></u><u class="u2"></u>';
      e.insertBefore(w, e.firstChild);
    }
  }
  if (d.readyState === 'loading' && d.addEventListener) d.addEventListener('DOMContentLoaded', run, false); else run();
})(document);
