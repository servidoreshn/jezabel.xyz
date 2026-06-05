// ════════════════════════════════════════════════════════════════════════
//  STORIES BY JEZ · snake-bg.js — the shared "living" layer.
//  Drops an ember/ash-drift canvas behind every page and slowly drifts a
//  "temperature" colour scarlet → magenta → orange (the fire coda), exposed
//  as CSS vars --temp / --temp-soft on :root. This is what makes the static
//  pages feel alive like chat/ and research/ — purely additive, no markup or
//  functionality is touched. Self-injecting, idempotent, dependency-free.
//  Vendored by copy within this site (relative include, no path deps).
// ════════════════════════════════════════════════════════════════════════
(function () {
  if (window.__snakeBg) return;            // idempotent — never double-init
  window.__snakeBg = true;

  // ── temperature drift (PLACEHOLDER random walk; revisit w/ sentiment later).
  //    stories ramp: scarlet → magenta → orange ─────────────────────────────
  var Temp = (function () {
    var t = 0.3, target = 0.3;
    setInterval(function () { target = Math.random(); }, 4000 + Math.random() * 2800);
    var COLD = [179, 0, 0], MID = [209, 26, 117], HOT = [255, 122, 24];
    function lerp(a, b, k) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }); }
    return {
      step: function () { t += (target - t) * 0.011; return t; },
      rgb:  function (v) { return v <= 0.5 ? lerp(COLD, MID, v / 0.5) : lerp(MID, HOT, (v - 0.5) / 0.5); }
    };
  })();

  function init() {
    if (document.getElementById('snakeEmbers')) return;
    var c = document.createElement('canvas');
    c.id = 'snakeEmbers';
    c.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    document.body.insertBefore(c, document.body.firstChild);   // behind all content
    var x = c.getContext('2d');

    var W, H, DPR, bits = [];
    function build() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = c.width  = window.innerWidth  * DPR;
      H = c.height = window.innerHeight * DPR;
      c.style.width  = window.innerWidth  + 'px';
      c.style.height = window.innerHeight + 'px';
      var n = Math.floor(window.innerWidth * window.innerHeight / 14000);
      bits = [];
      for (var i = 0; i < n; i++) bits.push({
        x: Math.random() * W, y: Math.random() * H,
        r: (Math.random() * 1.6 + 0.4) * DPR,
        vy: -(Math.random() * 0.25 + 0.06) * DPR,
        vx: (Math.random() - 0.5) * 0.12 * DPR,
        a: Math.random() * 0.5 + 0.2, ph: Math.random() * 6.28
      });
    }
    build();
    window.addEventListener('resize', build);

    var root = document.documentElement.style, t = 0;
    function frame() {
      t += 0.016;
      var v = Temp.step(), col = Temp.rgb(v);
      // clear to transparent each frame so the Landing.png background shows through
      x.clearRect(0, 0, W, H);
      root.setProperty('--temp',      'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')');
      root.setProperty('--temp-soft', 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',.5)');
      for (var i = 0; i < bits.length; i++) {
        var b = bits[i];
        b.y += b.vy; b.x += b.vx + Math.sin(t + b.ph) * 0.15 * DPR;
        if (b.y < -4) { b.y = H + 4; b.x = Math.random() * W; }
        var fl = b.a * (0.6 + 0.4 * Math.sin(t * 2 + b.ph));
        x.beginPath(); x.arc(b.x, b.y, b.r, 0, 6.2832);
        x.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + fl + ')';
        x.shadowBlur = 8 * DPR; x.shadowColor = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',.7)';
        x.fill(); x.shadowBlur = 0;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
