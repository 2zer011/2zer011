/* 2zer011-slide engine v1 - plain ES3/ES5, no dependencies. Works IE9+, Chrome 20+ (Win7 ok). */
(function (w, d) {
  var stage = d.getElementById('stage'), slides = [], cur = -1, busy = false, rotated = false, scale = 1;
  var hud, bar, grid, blank, startEl, numEl, hudTimer, morphTimer, cycle = ['slide', 'fade', 'zoom', 'flip', 'rise', 'spin', 'blur'];
  var tx = ['transform', 'webkitTransform', 'msTransform'];
  var ds = d.documentElement.style; if ('animation' in ds || 'webkitAnimation' in ds) d.documentElement.className += ' anim';

  function $(id) { return d.getElementById(id); }
  function gc(e) { return e.getAttribute('class') || ''; }
  function hasCls(e, c) { return (' ' + gc(e) + ' ').indexOf(' ' + c + ' ') > -1; }
  function add(e, c) { if (!hasCls(e, c)) e.setAttribute('class', (gc(e) + ' ' + c).replace(/^\s+/, '')); }
  function del(e, c) { e.setAttribute('class', (' ' + gc(e) + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, '')); }
  function each(list, fn) { for (var i = 0; i < list.length; i++) fn(list[i], i); }
  function steps(s) { return s.querySelectorAll ? s.querySelectorAll('[data-step]') : []; }

  /* ---- fit stage: scale to window, rotate 90deg on portrait phones ---- */
  function fit() {
    var W = w.innerWidth || d.documentElement.clientWidth, H = w.innerHeight || d.documentElement.clientHeight;
    rotated = H > W && W < 900;
    var vw = rotated ? H : W, vh = rotated ? W : H;
    scale = Math.min(vw / 1280, vh / 720);
    var t = (rotated ? 'rotate(90deg) ' : '') + 'scale(' + scale + ')';
    for (var i = 0; i < tx.length; i++) stage.style[tx[i]] = t;
  }

  /* ---- fullscreen + landscape lock (needs a user gesture) ---- */
  function goFull() {
    var e = d.documentElement, f = e.requestFullscreen || e.webkitRequestFullscreen || e.mozRequestFullScreen || e.msRequestFullscreen;
    try { if (f) { var p = f.call(e); if (p && p['catch']) p['catch'](function () {}); } } catch (x) {}
    try { var o = w.screen && (screen.orientation || {}); if (o.lock) { var q = o.lock('landscape'); if (q && q['catch']) q['catch'](function () {}); } } catch (y) {}
  }
  function isFull() { return !!(d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement); }
  function exitFull() {
    var f = d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen;
    try { if (f) f.call(d); } catch (x) {}
  }
  function toggleFull() { if (isFull()) exitFull(); else goFull(); }

  /* ---- svg line drawing prep ---- */
  function prepDraw(root) {
    each(root.querySelectorAll('.draw'), function (p) {
      try {
        var L = Math.ceil(p.getTotalLength ? p.getTotalLength() : 2000) + 2;
        p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      } catch (e) {}
    });
  }

  /* ---- polygon morph: <polygon class="morph" data-shapes="3,4,6,96" data-r="150" data-label="#id"> ---- */
  function ngon(k, R, N) {
    var pts = [], seg = 2 * Math.PI / k, i, th, phi, r;
    for (i = 0; i < N; i++) {
      th = 2 * Math.PI * i / N; phi = (th + Math.PI / 2) % seg;
      r = R * Math.cos(Math.PI / k) / Math.cos(phi - seg / 2);
      pts.push([r * Math.cos(th - Math.PI / 2), r * Math.sin(th - Math.PI / 2)]);
    }
    return pts;
  }
  function runMorph(slide) {
    clearInterval(morphTimer);
    var el = slide.querySelector ? slide.querySelector('.morph') : null; if (!el) return;
    var ks = el.getAttribute('data-shapes').split(','), R = +el.getAttribute('data-r') || 150, N = 96, i, sets = [];
    for (i = 0; i < ks.length; i++) sets.push(ngon(+ks[i], R, N));
    var lab = el.getAttribute('data-label'); lab = lab && $(lab.replace('#', ''));
    var vl = el.getAttribute('data-vlabel'); vl = vl && $(vl.replace('#', '')); var vals = (el.getAttribute('data-vals') || '').split(';');
    var HOLD = 1000, MOVE = 1100, seg = HOLD + MOVE, t0 = new Date().getTime();
    function draw(a, b, u) {
      var s = '', j; u = u * u * (3 - 2 * u);
      for (j = 0; j < N; j++) s += (a[j][0] + (b[j][0] - a[j][0]) * u).toFixed(1) + ',' + (a[j][1] + (b[j][1] - a[j][1]) * u).toFixed(1) + ' ';
      el.setAttribute('points', s);
    }
    function tick() {
      var t = new Date().getTime() - t0, n = Math.floor(t / seg), ph = t - n * seg;
      if (n >= sets.length - 1) { draw(sets[sets.length - 1], sets[sets.length - 1], 1); if (lab) lab.innerHTML = ks[ks.length - 1]; if (vl) vl.innerHTML = vals[ks.length - 1]; clearInterval(morphTimer); return; }
      draw(sets[n], sets[n + 1], ph < HOLD ? 0 : (ph - HOLD) / MOVE);
      var q = ph < HOLD + MOVE / 2 ? n : n + 1; if (lab) lab.innerHTML = ks[q]; if (vl) vl.innerHTML = vals[q];
    }
    tick(); morphTimer = setInterval(tick, 33);
  }


  /* ---- auto entrance: any text/card/row without an fx gets one (staggered) ---- */
  function cls(e) { return e.getAttribute('class') || ''; }
  function hasFx(e) { return /(^|\s)(fx-|draw|morph|fill|bgart|shine|ttl)/.test(cls(e)); }
  function covered(e, s) { var p = e.parentNode; while (p && p !== s) { if (p.getAttribute && (p.getAttribute('data-step') !== null || /(^|\s)(fx-|bgart|portrait|cascade)/.test(cls(p)))) return true; p = p.parentNode; } return false; }
  function autoFx(s) {
    var els = s.querySelectorAll('.tag,h2,h3,p,li,tr,.q,.card,.pad > ul,.pad > table,.pad > div,.pad > svg,.slide > div,.slide > p,.slide > svg'), i, e, n = 0, t;
    for (i = 0; i < els.length; i++) {
      e = els[i];
      if (hasFx(e) || e.getAttribute('data-step') !== null || covered(e, s)) continue;
      t = e.tagName.toLowerCase();
      e.className = (cls(e) + ' ' + (t === 'li' || t === 'h2' ? 'fx-left' : hasCls(e, 'q') ? 'fx-right' : t === 'svg' ? 'fx-fade' : 'fx-up')).replace(/^\s+/, '');
      var dl = Math.min(2.4, .15 + n * .11) + 's'; e.style.animationDelay = dl; e.style.webkitAnimationDelay = dl; n++;
    }
  }

  /* ---- title letters wave-in ---- */
  function esc(c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c; }
  function splitTitle(h) {
    if (h.children.length) return;
    var w = h.textContent.split(' '), o = '', n = 0, i, k, dl;
    h.className = h.className.replace(/(^|\s)fx-\w+/g, '') + ' ttl';
    for (i = 0; i < w.length; i++) {
      o += '<span style="white-space:nowrap">';
      for (k = 0; k < w[i].length; k++, n++) { dl = Math.min(1.5, .1 + n * .035).toFixed(2) + 's'; o += '<span class="lt" style="animation-delay:' + dl + ';-webkit-animation-delay:' + dl + '">' + esc(w[i].charAt(k)) + '</span>'; }
      o += '</span> ';
    }
    h.innerHTML = o;
  }
  /* ---- count-up numbers: <b class="count" data-to="1325" data-dec="0"> ---- */
  function fmt(v, dec) { var s = (dec ? v.toFixed(dec) : String(Math.round(v))).split('.'); return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (dec ? ',' + s[1] : ''); }
  function countUp(e) {
    var to = parseFloat(e.getAttribute('data-to')), dec = +e.getAttribute('data-dec') || 0, t0 = new Date().getTime(), D = +e.getAttribute('data-ms') || 1700;
    clearInterval(e._t); e.innerHTML = fmt(0, dec);
    e._t = setInterval(function () { var u = Math.min(1, (new Date().getTime() - t0) / D); u = 1 - Math.pow(1 - u, 3); e.innerHTML = fmt(to * u, dec); if (u >= 1) clearInterval(e._t); }, 33);
  }
  function setFinal(e) { clearInterval(e._t); e.innerHTML = fmt(parseFloat(e.getAttribute('data-to')), +e.getAttribute('data-dec') || 0); }
  function inStep(e, s) { while (e && e !== s) { if (e.getAttribute && e.getAttribute('data-step') !== null) return true; e = e.parentNode; } return false; }
  function counts(s, back) {
    each(s.querySelectorAll('.count'), function (e) {
      clearInterval(e._t); clearTimeout(e._d);
      if (inStep(e, s)) { if (back) setFinal(e); else e.innerHTML = fmt(0, +e.getAttribute('data-dec') || 0); }
      else { e.innerHTML = fmt(0, +e.getAttribute('data-dec') || 0); e._d = setTimeout(function () { countUp(e); }, 700); }
    });
  }
  function stepCounts(el) { var l = [].slice.call(el.querySelectorAll('.count')); if (hasCls(el, 'count')) l.push(el); each(l, countUp); }
  /* ---- navigation ---- */
  function revealed(s) { var n = 0; each(steps(s), function (e) { if (hasCls(e, 'on')) n++; }); return n; }
  function resetSteps(s, all) { each(steps(s), function (e) { if (all) add(e, 'on'); else del(e, 'on'); }); }
  function ui() {
    bar.style.width = ((cur + 1) / slides.length * 100) + '%';
    numEl.innerHTML = (cur + 1) + ' / ' + slides.length;
    if (w.history && history.replaceState) try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
  }
  function go(n, back) {
    if (n < 0 || n >= slides.length || n === cur) return;
    var old = cur >= 0 ? slides[cur] : null, nu = slides[n], type = nu.getAttribute('data-t') || cycle[n % cycle.length];
    back = back === undefined ? n < cur : back;
    if (old) { old.className = old.className.replace(/ ?(cur|leaving|rev|in-\w+|out-\w+)/g, ''); }
    each(slides, function (s) { if (s !== nu && s !== old) s.className = s.className.replace(/ ?(cur|leaving|rev|in-\w+|out-\w+)/g, ''); });
    resetSteps(nu, back);
    nu.className += ' cur in-' + type + (back ? ' rev' : '');
    if (old) { old.className += ' leaving out-' + type + (back ? ' rev' : ''); }
    var o = old; cur = n; ui();
    clearTimeout(go.t);
    go.t = setTimeout(function () {
      if (o) o.className = o.className.replace(/ ?(leaving|rev|in-\w+|out-\w+)/g, '');
      nu.className = nu.className.replace(/ ?(rev|in-\w+|out-\w+)/g, '');
    }, 1050);
    runMorph(nu); counts(nu, back);
  }
  function next() {
    var s = slides[cur], st = steps(s), n = revealed(s);
    if (n < st.length) { add(st[n], 'on'); stepCounts(st[n]); return; }
    go(cur + 1, false);
  }
  function prev() {
    var s = slides[cur], st = steps(s), n = revealed(s);
    if (n > 0) { del(st[n - 1], 'on'); return; }
    go(cur - 1, true);
  }

  /* ---- hud / grid / blank ---- */
  function poke() { add(hud, 'show'); clearTimeout(hudTimer); hudTimer = setTimeout(function () { del(hud, 'show'); }, 2600); }
  function toggleGrid() {
    if (grid.style.display === 'block') { grid.style.display = 'none'; return; }
    var h = '', i; for (i = 0; i < slides.length; i++) h += '<a data-i="' + i + '"' + (i === cur ? ' class="me"' : '') + '>' + (i + 1) + '. ' + (slides[i].getAttribute('data-title') || 'Slide ' + (i + 1)) + '</a>';
    grid.innerHTML = h; grid.style.display = 'block';
  }
  function toggleBlank() { blank.style.display = blank.style.display === 'block' ? 'none' : 'block'; }

  function begin() {
    startEl.style.display = 'none'; goFull(); fit(); poke();
    setTimeout(fit, 300);
  }

  function init() {
    each(stage.children, function (s) { if (hasCls(s, 'slide')) slides.push(s); });
    var ui_ = d.createElement('div'); ui_.id = 'ui';
    ui_.innerHTML = '<div id="bar"></div><div id="hud"><button id="bP" title="Trước">&#9664;</button><button id="bN" title="Sau">&#9654;</button><button id="bG" title="Mục lục (G)">&#9776;</button><button id="bF" title="Toàn màn hình (F)">&#9974;</button><span id="num"></span></div>' +
      '<div id="grid"></div><div id="blank"></div><div id="start"><div>' + (d.title || '') + '<small>Phím &larr; &rarr; / chạm cạnh màn hình / vuốt &bull; F toàn màn hình &bull; G mục lục &bull; B tối màn hình</small><b>&#9654; Bắt đầu trình chiếu</b></div></div>';
    d.body.appendChild(ui_);
    hud = $('hud'); bar = $('bar'); grid = $('grid'); blank = $('blank'); startEl = $('start'); numEl = $('num');
    each(slides, function (s) { each(s.querySelectorAll('h2'), splitTitle); autoFx(s); prepDraw(s); });
    $('bP').onclick = function (e) { prev(); poke(); };
    $('bN').onclick = function (e) { next(); poke(); };
    $('bG').onclick = toggleGrid; $('bF').onclick = toggleFull;
    grid.onclick = function (e) { e = e || w.event; var t = e.target || e.srcElement, i = t.getAttribute && t.getAttribute('data-i'); if (i !== null && i !== undefined) { grid.style.display = 'none'; go(+i); } else grid.style.display = 'none'; };
    startEl.onclick = begin;

    /* keyboard */
    d.onkeydown = function (e) {
      e = e || w.event; var k = e.keyCode;
      if (startEl.style.display !== 'none' && (k === 13 || k === 32)) { begin(); return false; }
      if (k === 39 || k === 40 || k === 32 || k === 34 || k === 13) next();
      else if (k === 37 || k === 38 || k === 33 || k === 8) prev();
      else if (k === 36) go(0); else if (k === 35) go(slides.length - 1);
      else if (k === 70) toggleFull(); else if (k === 71) toggleGrid(); else if (k === 66 || k === 190) toggleBlank();
      else if (k === 27) { grid.style.display = 'none'; blank.style.display = 'none'; }
      else return;
      poke(); if (e.preventDefault) e.preventDefault(); return false;
    };
    d.onmousemove = poke;

    /* tap zones + swipe (axes follow rotation) */
    var sx, sy, st0, down = false;
    function pt(e) { var t = (e.changedTouches && e.changedTouches[0]) || e; return [t.clientX, t.clientY]; }
    function axis(p) { return rotated ? [p[1], p[0]] : [p[0], p[1]]; } /* [along stage x, along stage y] in screen coords */
    function onDown(e) { if (startEl.style.display !== 'none' || grid.style.display === 'block') return; var p = pt(e); sx = p[0]; sy = p[1]; st0 = new Date().getTime(); down = true; }
    function onUp(e) {
      if (!down) return; down = false; var p = pt(e), a = axis([p[0] - sx, p[1] - sy]), dx = a[0], big = Math.max(Math.abs(p[0] - sx), Math.abs(p[1] - sy));
      var t = e.target || e.srcElement; if (t && t.id && t.id.charAt(0) === 'b' && t.tagName === 'BUTTON') return;
      if (big < 14) { /* tap */
        var pos = rotated ? p[1] / (w.innerHeight || 1) : p[0] / (w.innerWidth || 1);
        if (pos < .28) prev(); else next();
      } else if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(a[1])) { if (dx < 0) next(); else prev(); }
      poke();
    }
    if ('ontouchstart' in w) { stage.addEventListener('touchstart', onDown, false); stage.addEventListener('touchend', onUp, false); }
    else { stage.onmousedown = onDown; stage.onmouseup = onUp; }
    stage.addEventListener && stage.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

    w.onresize = fit; w.onorientationchange = function () { setTimeout(fit, 200); };
    d.addEventListener && d.addEventListener('fullscreenchange', fit, false);
    d.addEventListener && d.addEventListener('webkitfullscreenchange', fit, false);
    fit();
    var h = parseInt((w.location.hash || '').replace('#', ''), 10);
    go(h > 0 && h <= slides.length ? h - 1 : 0, false);
  }
  if (d.readyState === 'loading' && d.addEventListener) d.addEventListener('DOMContentLoaded', init, false); else init();
})(window, document);
