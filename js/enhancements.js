/* ============================================================
   ENHANCEMENTS.JS — PWA, glitch, stagger
   Кастомный курсор убран.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     PWA — регистрация service worker
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
     GLITCH НА СЧЁТЧИКАХ
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
     STAGGER
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
      if (!p.classList.contains('reveal')) p.classList.add('reveal');
      obs.observe(p);
    });
  })();

  console.log('%cENHANCEMENTS · loaded', 'color:#ff2d75; font-family:monospace;');
})();