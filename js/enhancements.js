/* ============================================================
   ENHANCEMENTS.JS — PWA, курсор, glitch, stagger
   Админ-панель вынесена в index.html (inline)
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     PWA — регистрация service worker
     Только для владельца: ?install=spodzh один раз открыть
     ============================================================ */
  (function initPWA() {
    var url = new URL(location.href);
    var isOwner = false;
    try { isOwner = localStorage.getItem('spodzh_owner') === '1'; } catch (e) {}

    if (url.searchParams.get('install') === 'spodzh') {
      try { localStorage.setItem('spodzh_owner', '1'); } catch (e) {}
      isOwner = true;
    }

    if (!isOwner) return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(function () {
        console.log('[pwa] service worker зарегистрирован');
      })
      .catch(function (err) {
        console.warn('[pwa] register failed:', err);
      });
  })();

  /* ============================================================
     КАСТОМНЫЙ КУРСОР — красный крестик (только desktop)
     ============================================================ */
  (function initCursor() {
    var hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasHover || reduced) return;

    var cursor = document.createElement('div');
    cursor.className = 'cursor-crosshair';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    document.body.classList.add('has-custom-cursor');

    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var tx = cx;
    var ty = cy;
    var rafId = null;

    function loop() {
      cx += (tx - cx) * 0.28;
      cy += (ty - cy) * 0.28;
      cursor.style.transform =
        'translate(' + cx.toFixed(1) + 'px, ' + cy.toFixed(1) + 'px) translate(-50%, -50%)';
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = null;
      }
    }

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(loop);
    }, { passive: true });

    var interactiveSel = 'a, button, [role="button"], input, textarea, .work-mini, .clip-card, .work-clips__btn, .clip-card__cta';

    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (t.closest && t.closest(interactiveSel)) {
        cursor.classList.add('cursor-crosshair--active');
      }
    });

    document.addEventListener('mouseout', function (e) {
      var t = e.target;
      if (t.closest && t.closest(interactiveSel)) {
        cursor.classList.remove('cursor-crosshair--active');
      }
    });

    document.addEventListener('mouseleave', function () {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      cursor.style.opacity = '1';
    });
  })();

  /* ============================================================
     GLITCH НА СЧЁТЧИКАХ — при достижении финального значения
     ============================================================ */
  (function initCounterGlitch() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    function triggerGlitch(el) {
      if (el.dataset.glitchDone === '1') return;
      el.dataset.glitchDone = '1';
      el.classList.add('counter-done');
      setTimeout(function () { el.classList.remove('counter-done'); }, 750);
    }

    counters.forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || '';
      var finalText = target.toLocaleString('ru-RU') + suffix;

      if (el.textContent === finalText) {
        triggerGlitch(el);
        return;
      }

      var obs = new MutationObserver(function () {
        if (el.textContent === finalText) {
          triggerGlitch(el);
          obs.disconnect();
        }
      });
      obs.observe(el, { childList: true, characterData: true, subtree: true });

      setTimeout(function () {
        if (el.dataset.glitchDone !== '1') {
          triggerGlitch(el);
          obs.disconnect();
        }
      }, 3200);
    });
  })();

  /* ============================================================
     STAGGER — карточки появляются по очереди
     ============================================================ */
  (function initStagger() {
    var parents = document.querySelectorAll('.stagger-parent');
    if (!parents.length) return;
    if (!('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    parents.forEach(function (p) {
      if (!p.classList.contains('reveal')) {
        p.classList.add('reveal');
      }
      obs.observe(p);
    });
  })();

  console.log('%cENHANCEMENTS · loaded', 'color:#ff2d75; font-family:monospace;');
})();