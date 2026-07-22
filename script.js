/* Hybrid Performance — script.js */

// ── Ano footer ──
(function () {
  'use strict';
  document.querySelectorAll('[data-year]').forEach(function (el) {
    if (!el.textContent || el.textContent.trim().startsWith('{{')) {
      el.textContent = new Date().getFullYear();
    }
  });
})();

// ── Scroll canvas — cover mode ──
(function () {
  'use strict';
  var canvas  = document.getElementById('scroll-canvas');
  var section = document.getElementById('scroll-anim');
  if (!canvas || !section) return;

  var ctx  = canvas.getContext('2d');
  var pin  = section.querySelector('.scroll-anim-pin');

  var FRAME_PATH   = 'https://8ispuxmgjxgu2r5q.public.blob.vercel-storage.com/templates/fitness-004/frames/';
  var FRAME_COUNT  = 151;
  var FRAME_PREFIX = 'frame_';
  var FRAME_PAD    = 4;
  var FRAME_EXT    = '.webp';

  var images = [];
  var loaded = 0;

  function setupCanvas() {
    var dpr = window.devicePixelRatio || 1;
    var cw  = pin.clientWidth;
    var ch  = pin.clientHeight;
    canvas.width  = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width  = cw + 'px';
    canvas.style.height = ch + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function renderFrame(img) {
    var cw = pin.clientWidth;
    var ch = pin.clientHeight;
    var iw = img.naturalWidth;
    var ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih); /* COVER mode */
    var dw = iw * scale;
    var dh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  function render(progress) {
    var idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(progress * FRAME_COUNT)));
    var img = images[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    renderFrame(img);
  }

  for (var i = 1; i <= FRAME_COUNT; i++) {
    var img = new Image();
    img.src = FRAME_PATH + FRAME_PREFIX + String(i).padStart(FRAME_PAD, '0') + FRAME_EXT;
    (function (image) {
      image.onload = function () {
        loaded++;
        if (loaded === 1) { setupCanvas(); render(0); }
      };
    })(img);
    images.push(img);
  }

  function onScroll() {
    var rect       = section.getBoundingClientRect();
    var scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) { render(0); return; }
    render(Math.min(1, Math.max(0, -rect.top / scrollable)));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setupCanvas(); onScroll(); });
})();

// ── Nav active state ──
(function () {
  'use strict';
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length || !sections.length) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = '#' + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-72px 0px -55% 0px', threshold: 0 });
  sections.forEach(function (s) { obs.observe(s); });
})();

// ── Hero figure parallax ──
(function () {
  'use strict';
  var media = document.querySelector('.hero-media');
  if (!media) return;
  function onParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var rect   = hero.getBoundingClientRect();
    var pct    = -rect.top / window.innerHeight;
    media.style.transform = 'translateY(calc(-40px + ' + (pct * 24) + 'px))';
  }
  window.addEventListener('scroll', onParallax, { passive: true });
})();

// ── IntersectionObservers ──
if ('IntersectionObserver' in window) {
  var fadeObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        fadeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.fade-up').forEach(function (el) { fadeObs.observe(el); });

  var stagObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        stagObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.stagger-card').forEach(function (el) { stagObs.observe(el); });

} else {
  document.querySelectorAll('.fade-up, .stagger-card').forEach(function (el) {
    el.classList.add('visible');
  });
}

// ── Failsafe — elementi visibili al caricamento ──
window.addEventListener('load', function () {
  setTimeout(function () {
    document.querySelectorAll('.fade-up:not(.visible), .stagger-card:not(.visible)').forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 120);
});

// ── Fallback imagens ──
window.__imgFallback = function (img, label) {
  var wrap = document.createElement('div');
  wrap.className = 'img-svg-fallback';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', label || 'imagem em breve');
  var gid = 'g' + Date.now() + Math.random().toString(36).substr(2, 5);
  wrap.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">' +
    '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/>' +
    '<stop offset="100%" stop-color="currentColor" stop-opacity="0.03"/>' +
    '</linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#' + gid + ')"/>' +
    '<text x="400" y="310" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="18" fill="currentColor" opacity="0.3">' + label + '</text>' +
    '</svg>';
  img.replaceWith(wrap);
};
