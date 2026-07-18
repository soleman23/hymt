/* Hit Your Mark Travel — theme behaviours */
(function () {
  'use strict';

  /* Nav scroll state + mobile toggle */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  var toggle = document.getElementById('mobileToggle');
  var links = document.getElementById('navLinks');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  if (links) {
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
  }

  /* Hero carousel */
  var slides = [].slice.call(document.querySelectorAll('.hero__slide'));
  var dots = [].slice.call(document.querySelectorAll('.hero__dot'));
  if (slides.length > 1) {
    var i = 0, t;
    var go = function (n) {
      i = n;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === n); });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === n); });
    };
    var reset = function () { clearInterval(t); t = setInterval(function () { go((i + 1) % slides.length); }, 6000); };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); reset(); }); });
    reset();
  }

  /* FAQ accordions (page-faq + faq-page patterns) */
  document.querySelectorAll('.pf-item__q, .faq-item__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement;
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.open').forEach(function (o) { o.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* Journal filter chips */
  var chips = [].slice.call(document.querySelectorAll('.journal-filter__chip'));
  var cards = [].slice.call(document.querySelectorAll('.article-card'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var f = chip.getAttribute('data-filter');
      cards.forEach(function (card) {
        var show = f === 'all' || (card.getAttribute('data-filter') || '').split(' ').indexOf(f) !== -1;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* Plan-your-trip ?type= preselection */
  var typeSelect = document.getElementById('inq-type');
  if (typeSelect) {
    var m = new URLSearchParams(window.location.search).get('type');
    if (m) {
      Array.prototype.forEach.call(typeSelect.options, function (o) {
        if (o.value.toLowerCase().indexOf(m.toLowerCase()) !== -1) typeSelect.value = o.value;
      });
    }
  }
})();
