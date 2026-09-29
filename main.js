/* MARU — interactions. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = reduceMQ.matches;
  reduceMQ.addEventListener && reduceMQ.addEventListener('change', function (e) { reduced = e.matches; });

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Nav: scrolled state, mobile menu, dock ---------- */
  var nav = $('#nav');
  var dock = $('#dock');
  var hero = $('.hero');
  var pricing = $('#pricing');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    if (dock) {
      var pastHero = y > hero.offsetHeight * 0.8;
      var pr = pricing.getBoundingClientRect();
      var atPricing = pr.top < window.innerHeight && pr.bottom > 0;
      dock.classList.toggle('is-on', pastHero && !atPricing && !document.body.classList.contains('menu-open'));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = $('#navToggle');
  var menu = $('#mobileMenu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    nav.classList.toggle('is-scrolled', open || window.scrollY > 30);
    if (open) { var first = $('a', menu); first && first.focus(); }
    onScroll();
  }
  toggle.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
    // keep focus inside the open menu
    if (e.key === 'Tab' && !menu.hidden) {
      var items = [toggle].concat($$('a', menu));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080 && !menu.hidden) setMenu(false); });

  /* ---------- Active nav highlighting ---------- */
  var navLinks = $$('[data-nav]');
  var sectionFor = {};
  navLinks.forEach(function (a) { sectionFor[a.getAttribute('href').slice(1)] = a; });
  // sections without their own link map to the nearest one
  var alias = { journey: 'hangul', guarantees: 'pricing' };
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = alias[en.target.id] || en.target.id;
        navLinks.forEach(function (a) {
          var on = sectionFor[id] === a;
          a.classList.toggle('is-active', on);
          on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Scroll reveals ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Hero parallax (mouse + scroll) ---------- */
  var layers = $$('.hero [data-depth]');
  var mx = 0, my = 0, tx = 0, ty = 0, heroVisible = true, rafId = null;
  function frame() {
    rafId = null;
    if (reduced || !heroVisible) return;
    tx += (mx - tx) * 0.06; ty += (my - ty) * 0.06;
    var sy = Math.min(window.scrollY, window.innerHeight);
    layers.forEach(function (l) {
      var d = parseFloat(l.dataset.depth);
      l.style.transform = 'translate3d(' + (-tx * d * 400).toFixed(1) + 'px,' + (-ty * d * 200 + sy * d * 2.2).toFixed(1) + 'px,0)';
    });
    if (Math.abs(mx - tx) > 0.001 || Math.abs(my - ty) > 0.001) request();
  }
  function request() { if (!rafId) rafId = requestAnimationFrame(frame); }
  if (window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', function (e) {
      mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; request();
    });
  }
  window.addEventListener('scroll', request, { passive: true });

  /* ---------- Falling petals (canvas, capped & paused offscreen) ---------- */
  var canvas = $('#petals');
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');
  var petals = [], W = 0, H = 0, dpr = 1, petalRaf = null;
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn(top) {
    return { x: Math.random() * W, y: top ? -20 : Math.random() * H, r: 4 + Math.random() * 5, vy: 0.35 + Math.random() * 0.6,
      vx: -0.2 + Math.random() * 0.5, a: Math.random() * Math.PI * 2, va: 0.01 + Math.random() * 0.02, o: 0.45 + Math.random() * 0.45 };
  }
  function drawPetals() {
    petalRaf = null;
    if (reduced || !heroVisible || document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    petals.forEach(function (p, i) {
      p.y += p.vy; p.x += p.vx + Math.sin(p.a) * 0.4; p.a += p.va;
      if (p.y > H + 20 || p.x < -30 || p.x > W + 30) petals[i] = spawn(true);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, 0.55 + Math.abs(Math.sin(p.a)) * 0.45);
      ctx.globalAlpha = p.o; ctx.fillStyle = '#ffc9d6';
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    startPetals();
  }
  function startPetals() { if (!petalRaf && ctx && !reduced) petalRaf = requestAnimationFrame(drawPetals); }
  if (ctx && !reduced) {
    sizeCanvas();
    var petalCount = window.innerWidth < 700 ? 14 : 26;
    for (var i = 0; i < petalCount; i++) petals.push(spawn(false));
    window.addEventListener('resize', sizeCanvas);
    document.addEventListener('visibilitychange', startPetals);
    startPetals();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      heroVisible = en[0].isIntersecting;
      if (heroVisible) { request(); startPetals(); }
    }).observe(hero);
  }

  /* ---------- Interactive Hangul ---------- */
  var syllables = $$('.syllable');
  var reveal = $('#hangulReveal');
  var allBtn = $('#hangulAll');
  function updateHangul() {
    var allOpen = syllables.every(function (s) { return s.classList.contains('is-open'); });
    reveal.classList.toggle('is-on', allOpen);
    allBtn.textContent = allOpen ? 'Put it back together' : 'Reveal the whole word';
  }
  function setSyl(s, open) { s.classList.toggle('is-open', open); s.setAttribute('aria-pressed', String(open)); }
  syllables.forEach(function (s) {
    s.addEventListener('click', function () { setSyl(s, !s.classList.contains('is-open')); updateHangul(); });
    if (window.matchMedia('(hover: hover)').matches) {
      s.addEventListener('mouseenter', function () { setSyl(s, true); updateHangul(); });
    }
  });
  allBtn.addEventListener('click', function () {
    var open = !syllables.every(function (s) { return s.classList.contains('is-open'); });
    syllables.forEach(function (s, i) {
      setTimeout(function () { setSyl(s, open); updateHangul(); }, reduced ? 0 : i * 220);
    });
  });

  /* ---------- 30-day journey (ARIA tabs) ---------- */
  var stops = $$('.stop');
  var panels = $$('.jpanel');
  var fill = $('#journeyFill');
  var count = $('#journeyCount');
  var current = 0;
  function go(n, focus) {
    current = (n + stops.length) % stops.length;
    stops.forEach(function (s, i) {
      var on = i === current;
      s.classList.toggle('is-active', on);
      s.classList.toggle('is-done', i < current);
      s.setAttribute('aria-selected', String(on));
      s.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
      panels[i].classList.toggle('is-active', on);
    });
    fill.style.width = (current / (stops.length - 1) * 100) + '%';
    count.textContent = (current + 1) + ' / ' + stops.length;
    if (focus) stops[current].focus();
  }
  stops.forEach(function (s, i) {
    s.addEventListener('click', function () { go(i); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(current + 1, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(current - 1, true); }
      if (e.key === 'Home') { e.preventDefault(); go(0, true); }
      if (e.key === 'End') { e.preventDefault(); go(stops.length - 1, true); }
    });
  });
  $('#journeyPrev').addEventListener('click', function () { go(current - 1); });
  $('#journeyNext').addEventListener('click', function () { go(current + 1); });
  go(0);

  /* ---------- Weekly schedule language toggle ---------- */
  var langBtns = $$('[data-week-lang]');
  langBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var ru = b.dataset.weekLang === 'ru';
      langBtns.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      $$('.week [data-en]').forEach(function (el) { el.hidden = ru; });
      $$('.week [data-ru]').forEach(function (el) { el.hidden = !ru; });
    });
  });

  /* ---------- Vimeo facade (loads player only on click) ---------- */
  var vbtn = $('.video-facade__btn');
  if (vbtn) {
    vbtn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://player.vimeo.com/video/' + vbtn.dataset.vimeo + '?autoplay=1';
      f.title = 'Maru lesson snippet';
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.allowFullscreen = true;
      vbtn.replaceWith(f);
      f.focus();
    });
  }

  /* ---------- Learn scenes: gentle image parallax ---------- */
  var sceneImgs = $$('.scene__media img');
  var sceneTick = false;
  function sceneParallax() {
    sceneTick = false;
    if (reduced) return;
    var vh = window.innerHeight;
    sceneImgs.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.setProperty('--py', (p * -24).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () { if (!sceneTick) { sceneTick = true; requestAnimationFrame(sceneParallax); } }, { passive: true });

  /* ---------- Why Korean: sticky visual follows chapters ---------- */
  var chapters = $$('.chapter');
  var whyImgs = $$('.why__img');
  var whyDots = $$('.why__dots li');
  var numeral = $('#whyNumeral');
  var words = ['하나', '둘', '셋', '넷', '다섯'];
  function setWhy(n) {
    chapters.forEach(function (c, i) { c.classList.toggle('is-active', i === n); });
    whyImgs.forEach(function (im, i) { im.classList.toggle('is-on', i === n); });
    whyDots.forEach(function (d, i) { d.classList.toggle('is-on', i === n); });
    numeral.textContent = words[n];
  }
  if ('IntersectionObserver' in window) {
    var whyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setWhy(+en.target.dataset.chapter); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    chapters.forEach(function (c) { whyIO.observe(c); });
  }
  setWhy(0);
})();
