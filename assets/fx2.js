/* ==========================================================================
   fx2.js  —  LỚP HIỆU ỨNG NÂNG CẤP (v2), ES5 thuần, không thư viện.
   --------------------------------------------------------------------------
   Nạp SAU engine.js. Engine gọi 2 hàm móc (hook) của đối tượng toàn cục FX:
       FX.enter(slideMoi, slideCu, laLuiLai)  - mỗi lần sang slide
       FX.step(phanTuVuaHien)                 - mỗi lần bấm hiện 1 khối data-step
   Mọi thứ trong file này bọc try/catch: nếu lỗi thì bài vẫn chạy như cũ.

   Tính năng:
     A. Canvas hạt (bụi sao / tàn lửa / tia lửa / bụi vàng / cánh hoa) theo theme slide.
     B. Nổ tia lửa + vòng sóng tại khối vừa hiện.
     C. Tia sáng quét ngang mỗi lần sang slide.
     D. Parallax: nền SVG và quầng sáng xê dịch ngược chiều con trỏ chuột.
     E. Đèn rọi mềm bám theo con trỏ.
     F. Pháo hoa / hoa giấy ở slide cuối (đánh dấu data-finale).
     G. Sóng sáng chạy qua chữ tiêu đề lớn (.split).

   Thuộc tính HTML tùy chọn trên <section class="slide">:
     data-fx="stardust|embers|sparks|dust|petals|none"   ép kiểu hạt (mặc định theo theme)
     data-finale="1"                                     bắn pháo hoa khi vào slide
   Tắt hết: phím L / nút Lite / ?lite, hoặc hệ điều hành bật "giảm chuyển động".
   ========================================================================== */
(function (w, d) {
  'use strict';
  var W = 1280, H = 720;                       // kích thước "sân khấu" logic (khớp #stage)
  var stage, cv, cx, spot, sweep, ready = false;
  var cur = null;                              // slide đang hiển thị
  var parts = [];                              // hạt nền (ambient)
  var bursts = [];                             // hạt nổ (tia lửa, hoa giấy)
  var prof = null, light = false;              // hồ sơ hạt hiện tại + theme sáng/tối
  var mx = W / 2, my = H / 2, px = 0, py = 0;  // vị trí chuột (stage) và độ lệch parallax đã làm mượt
  var lastMove = 0, hasMouse = false, lastT = 0, finaleT = 0, idle = false;
  var reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var raf = w.requestAnimationFrame || w.webkitRequestAnimationFrame || function (f) { return setTimeout(function () { f(new Date().getTime()); }, 33); };

  /* ---------- tiện ích ---------- */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function isLite() { return /\blite\b/.test(d.body.className); }   // chế độ nhẹ do engine bật
  function off() { return reduce || isLite(); }                      // có nên tắt hiệu ứng mới không?

  /* Hồ sơ hạt theo kiểu. Mỗi hồ sơ:
       n    số hạt nền        cols  màu "r,g,b"       vy/vx  vận tốc (px/giây)
       r    bán kính          life  tuổi thọ (giây)    from   nơi sinh ra: 'any' | 'bottom' | 'top'
       shape 'dot' | 'petal'  */
  var PROF = {
    stardust: { n: 46, cols: ['255,240,200', '159,180,255', '255,217,138'], vy: [-5, -16], vx: [-4, 4], r: [.8, 2.2], life: [6, 13], from: 'any', shape: 'dot' },
    embers: { n: 36, cols: ['255,184,74', '255,122,58', '255,217,138'], vy: [-30, -70], vx: [-16, 16], r: [1, 2.8], life: [5, 10], from: 'bottom', shape: 'dot', sway: 1 },
    sparks: { n: 34, cols: ['255,217,138', '255,159,74', '127,214,232'], vy: [-60, -120], vx: [-22, 22], r: [.8, 2], life: [3, 6], from: 'bottom', shape: 'dot' },
    dust: { n: 34, cols: ['212,164,55', '184,124,36', '255,226,150'], vy: [-6, -20], vx: [-8, 8], r: [1, 2.6], life: [6, 12], from: 'any', shape: 'dot', sway: 1 },
    petals: { n: 20, cols: ['217,100,128', '240,150,170', '255,200,120'], vy: [22, 46], vx: [-14, 20], r: [3, 5.5], life: [11, 18], from: 'top', shape: 'petal', sway: 1 }
  };
  /* Theme -> kiểu hạt. Các class theme nằm trên <section class="slide ..."> */
  var BYTHEME = { rn: 'stardust', rm: 'sparks', rl: 'embers', dark: 'stardust', eg: 'dust', 'in': 'dust', cn: 'petals', gr: 'dust', ro: 'embers' };
  var LIGHT = { eg: 1, cn: 1, 'in': 1, gr: 1, ro: 1 };   // nền sáng => hạt phải đậm hơn

  function hasCls(e, c) { return (' ' + (e.getAttribute('class') || '') + ' ').indexOf(' ' + c + ' ') > -1; }
  function themeOf(s) { var k; for (k in BYTHEME) if (hasCls(s, k)) return k; return 'eg'; }

  /* ---------- khởi tạo: tạo canvas, đèn rọi, tia sáng; gắn sự kiện chuột ---------- */
  function setup() {
    if (ready) return; ready = true;
    stage = d.getElementById('stage'); if (!stage) return;
    d.documentElement.className += ' fx2';                   // bật các luật CSS trong fx2.css
    cv = d.createElement('canvas'); cv.id = 'fxc'; cv.width = W; cv.height = H;
    if (cv.getContext) cx = cv.getContext('2d');
    spot = d.createElement('div'); spot.id = 'fxspot';
    sweep = d.createElement('div'); sweep.id = 'fxsweep';
    stage.appendChild(cv); stage.appendChild(spot); stage.appendChild(sweep);
    glowTitles();
    if (d.addEventListener) d.addEventListener('mousemove', onMove, false);
    if (cx) raf(loop);
  }

  /* Đổi animation-delay của từng chữ (.ch) thành "chậm của chIn, chậm của chGlow"
     để sóng sáng chạy từ chữ đầu đến chữ cuối, bắt đầu sau khi chữ đã rơi xong (~1.9s). */
  function glowTitles() {
    var hs = d.querySelectorAll('.split'), i, k, chs, o;
    for (i = 0; i < hs.length; i++) {
      chs = hs[i].querySelectorAll('.ch');
      for (k = 0; k < chs.length; k++) {
        o = parseFloat(chs[k].style.animationDelay) || 0;
        chs[k].style.animationDelay = o + 's,' + (1.9 + k * .06).toFixed(2) + 's';
      }
    }
  }

  /* Chuột -> toạ độ trong stage (chia cho tỉ lệ co giãn). Bỏ qua khi màn hình đang xoay 90° (điện thoại dọc). */
  function onMove(e) {
    e = e || w.event; if (off()) return;
    var r = stage.getBoundingClientRect(), W0 = r.width || 1, H0 = r.height || 1;
    if (H0 > W0 * 1.2) return;                               // đang xoay dọc: bỏ qua
    var sc = W0 / W;
    mx = ((e.clientX - r.left) / sc); my = ((e.clientY - r.top) / sc);
    hasMouse = true; lastMove = new Date().getTime();
    spot.className = 'on';
  }

  /* ---------- hạt nền ---------- */
  function spawn(p, anywhere) {
    var P = prof, c = pick(P.cols);
    p.col = c; p.r = rnd(P.r[0], P.r[1]); p.life = rnd(P.life[0], P.life[1]);
    p.age = anywhere ? rnd(0, p.life) : 0;
    p.vx = rnd(P.vx[0], P.vx[1]); p.vy = rnd(P.vy[0], P.vy[1]);
    p.x = rnd(10, W - 10);
    p.y = (P.from === 'bottom') ? (anywhere ? rnd(0, H) : H + 8) : (P.from === 'top') ? (anywhere ? rnd(0, H) : -10) : rnd(10, H - 10);
    p.ph = rnd(0, 6.28); p.rot = rnd(0, 6.28); p.vr = rnd(-2, 2);
    return p;
  }
  function seed() {
    parts = []; if (!prof) return;
    for (var i = 0; i < prof.n; i++) parts.push(spawn({}, true));
  }

  /* ---------- hạt nổ ---------- */
  function boom(x, y, n, kind) {
    var i, a, s, cols = kind === 'confetti' ? ['255,217,138', '255,120,100', '127,214,232', '190,160,255', '150,230,170', '255,255,255'] : ['255,236,170', '255,200,90', '255,255,255', '255,160,70'];
    if (bursts.length > 420) return;                          // giới hạn để máy yếu không bị nặng
    for (i = 0; i < n; i++) {
      a = rnd(0, 6.283); s = kind === 'confetti' ? rnd(120, 460) : rnd(60, 300);
      bursts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (kind === 'confetti' ? 160 : 40), g: kind === 'confetti' ? 340 : 220,
        r: kind === 'confetti' ? rnd(3, 6) : rnd(1.2, 3), life: rnd(.8, kind === 'confetti' ? 2.2 : 1.4), age: 0, col: pick(cols),
        rect: kind === 'confetti', rot: rnd(0, 6.28), vr: rnd(-9, 9) });
    }
  }

  /* ---------- vòng lặp vẽ ---------- */
  function loop(t) {
    raf(loop);
    if (d.hidden) { lastT = 0; return; }
    var dt = lastT ? Math.min(.05, (t - lastT) / 1000) : .016; lastT = t;
    if (off()) {                                              // Lite / giảm chuyển động: dọn sạch một lần rồi nghỉ
      if (!idle) { cx.clearRect(0, 0, W, H); resetParallax(); bursts = []; spot.className = ''; idle = true; }
      return;
    }
    idle = false; cx.clearRect(0, 0, W, H);
    drawAmbient(dt); drawBursts(dt); parallax(dt); spotlight();
  }

  function drawAmbient(dt) {
    if (!prof) return;
    var i, p, a, base = light ? .62 : .9, petal = prof.shape === 'petal';
    for (i = 0; i < parts.length; i++) {
      p = parts[i]; p.age += dt;
      p.ph += dt * 1.6; p.rot += p.vr * dt;
      p.x += (p.vx + (prof.sway ? Math.sin(p.ph) * 14 : 0)) * dt; p.y += p.vy * dt;
      if (p.age > p.life || p.y < -14 || p.y > H + 14 || p.x < -14 || p.x > W + 14) { spawn(p, false); continue; }
      a = Math.sin(Math.PI * p.age / p.life) * base;               // mờ dần vào/ra: 0 -> base -> 0
      if (petal) {
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.scale(1, .55 + .45 * Math.abs(Math.sin(p.ph)));
        cx.fillStyle = 'rgba(' + p.col + ',' + a.toFixed(3) + ')'; cx.beginPath(); cx.ellipse ? cx.ellipse(0, 0, p.r * 1.5, p.r, 0, 0, 6.283) : cx.arc(0, 0, p.r, 0, 6.283); cx.fill(); cx.restore();
      } else {
        cx.fillStyle = 'rgba(' + p.col + ',' + (a * .16).toFixed(3) + ')'; cx.beginPath(); cx.arc(p.x, p.y, p.r * 3.2, 0, 6.283); cx.fill();   // quầng mờ
        cx.fillStyle = 'rgba(' + p.col + ',' + a.toFixed(3) + ')'; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();                  // lõi sáng
      }
    }
  }

  function drawBursts(dt) {
    var i, b, a;
    for (i = bursts.length - 1; i >= 0; i--) {
      b = bursts[i]; b.age += dt;
      if (b.age > b.life) { bursts.splice(i, 1); continue; }
      b.vy += b.g * dt; b.vx *= (1 - 1.4 * dt); b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
      a = 1 - b.age / b.life;
      cx.fillStyle = 'rgba(' + b.col + ',' + a.toFixed(3) + ')';
      if (b.rect) { cx.save(); cx.translate(b.x, b.y); cx.rotate(b.rot); cx.fillRect(-b.r, -b.r * .5, b.r * 2, b.r); cx.restore(); }
      else { cx.beginPath(); cx.arc(b.x, b.y, b.r * (.5 + a * .6), 0, 6.283); cx.fill(); }
    }
  }

  /* Parallax: dịch nền SVG (.bgart) một chút NGƯỢC chiều chuột, quầng sáng (.glow) ngược mạnh hơn -> cảm giác chiều sâu. */
  var ba = null, gl = null;
  function parallax(dt) {
    if (!cur || !hasMouse) return;
    var tx = (mx - W / 2) / (W / 2), ty = (my - H / 2) / (H / 2), k = Math.min(1, dt * 4);
    px += (tx - px) * k; py += (ty - py) * k;
    if (ba) ba.style.transform = ba.style.webkitTransform = 'translate3d(' + (-px * 16).toFixed(1) + 'px,' + (-py * 10).toFixed(1) + 'px,0) scale(1.04)';
    if (gl) gl.style.transform = gl.style.webkitTransform = 'translate3d(' + (px * 30).toFixed(1) + 'px,' + (py * 20).toFixed(1) + 'px,0)';
  }
  function resetParallax() {
    if (ba) ba.style.transform = ba.style.webkitTransform = '';
    if (gl) gl.style.transform = gl.style.webkitTransform = '';
  }

  /* Đèn rọi: bám chuột có làm mượt; tự tắt khi chuột đứng yên > 2.6s. */
  var sx = W / 2, sy = H / 2;
  function spotlight() {
    if (!hasMouse) return;
    sx += (mx - sx) * .18; sy += (my - sy) * .18;
    spot.style.transform = spot.style.webkitTransform = 'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0)';
    if (new Date().getTime() - lastMove > 2600 && spot.className) spot.className = '';
  }

  /* ---------- hook từ engine ---------- */
  /* Tọa độ phần tử trong hệ stage: cộng dồn offsetLeft/Top lên đến #stage.
     (offset* không bị ảnh hưởng bởi scale/rotate của stage nên đúng cả khi xoay điện thoại) */
  function pos(e) {
    var x = 0, y = 0, o = e;
    while (o && o !== stage) { x += o.offsetLeft || 0; y += o.offsetTop || 0; o = o.offsetParent; }
    return { x: x, y: y, w: e.offsetWidth || 0, h: e.offsetHeight || 0 };
  }

  function enter(s, old, back) {
    try {
      setup(); if (!stage) return;
      if (ba) resetParallax();
      cur = s; ba = s.querySelector('.bgart'); gl = s.querySelector('.glow'); px = py = 0;
      var th = themeOf(s), kind = s.getAttribute('data-fx') || BYTHEME[th];
      light = !!LIGHT[th]; prof = kind === 'none' ? null : PROF[kind] || PROF.dust; seed();
      if (!off()) { sweep.className = ''; void sweep.offsetWidth; sweep.className = 'go'; }   // khởi động lại animation tia sáng
      clearInterval(finaleT);
      if (s.getAttribute('data-finale') && !off() && !back) finale();
    } catch (e) {}
  }

  /* Pháo hoa: các chùm hoa giấy + tia lửa ở vị trí ngẫu nhiên, ~6 giây. */
  function finale() {
    var n = 0, t0 = new Date().getTime();
    function shot() {
      if (off() || new Date().getTime() - t0 > 6500) { clearInterval(finaleT); return; }
      boom(rnd(160, W - 160), rnd(120, 360), 34, 'spark');
      if (n % 2 === 0) boom(rnd(100, W - 100), rnd(60, 200), 26, 'confetti');
      n++;
    }
    setTimeout(shot, 900); finaleT = setInterval(shot, 520);
  }

  function step(el) {
    try {
      setup(); if (!stage || off()) return;
      var p = pos(el), cxp = p.x + p.w / 2, cyp = p.y + p.h / 2, sz = Math.max(110, Math.min(360, Math.min(p.w, p.h) * 1.4 + 60));
      if (p.w > 700) cxp = p.x + Math.min(p.w * .5, 420);    // khối rất rộng: nổ ở khoảng giữa trái thay vì giữa tuyệt đối
      var ring = d.createElement('div'); ring.className = 'fxring';
      ring.style.cssText = 'left:' + (cxp - sz / 2) + 'px;top:' + (cyp - sz / 2) + 'px;width:' + sz + 'px;height:' + sz + 'px';
      stage.appendChild(ring); setTimeout(function () { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 1000);
      boom(cxp, cyp, 16, 'spark');
    } catch (e) {}
  }

  w.FX = { enter: enter, step: step, boom: boom };           // boom() để thầy/cô gọi tay từ console nếu muốn thử
})(window, document);
