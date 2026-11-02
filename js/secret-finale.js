/* ============================================================
   SECRET-FINALE.JS — финальная сцена
   Версия: 1.0
   Слушает событие 'spodzh:finale-unlocked' из secret-console.js
   ============================================================ */
(function () {
  'use strict';

  var API = window.SpodzhSecrets;
  if (!API) {
    console.warn('[finale] SpodzhSecrets не найден');
    return;
  }

  var finaleRunning = false;

  function closeFinale() {
    var overlay = document.getElementById('finaleScreen');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    var p = API.progress();
    if (p && !p.finale_seen) {
      p.finale_seen = true;
      try { localStorage.setItem('spodzh_secrets_v1', JSON.stringify(p)); } catch (e) {}
    }
    addFooterBadge();
  }

  function addFooterBadge() {
    var left = document.querySelector('.footer__left');
    if (!left) return;
    if (left.querySelector('.footer-badge')) return;
    var badge = document.createElement('span');
    badge.className = 'footer-badge';
    badge.textContent = ' · ARCHIVE_COMPLETE';
    left.appendChild(badge);
  }

  function runFinale() {
    if (finaleRunning) return;
    var overlay = document.getElementById('finaleScreen');
    if (!overlay) return;

    finaleRunning = true;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    var lines = overlay.querySelectorAll('[data-finale-line]');
    lines.forEach(function (line, i) {
      setTimeout(function () { line.classList.add('show'); }, 900 + i * 850);
    });

    var closeBtn = overlay.querySelector('[data-finale-close]');
    if (closeBtn) {
      setTimeout(function () { closeBtn.classList.add('show'); },
        900 + lines.length * 850 + 400);
      if (!closeBtn.dataset.bound) {
        closeBtn.dataset.bound = '1';
        closeBtn.addEventListener('click', closeFinale);
      }
    }
  }

  document.addEventListener('spodzh:finale-unlocked', function () {
    setTimeout(runFinale, 400);
  });

  document.addEventListener('keydown', function (e) {
    var overlay = document.getElementById('finaleScreen');
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closeFinale();
    }
  });

  function init() {
    var p = API.progress();
    if (p && p.finale_seen) addFooterBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('%c[finale] module loaded', 'color:#ff2222; font-family:monospace;');
})();