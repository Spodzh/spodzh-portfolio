/* ============================================================
   ENHANCEMENTS.JS — PWA, админ-панель, курсор, glitch, stagger
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     11. PWA — регистрация service worker
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
     17. КАСТОМНЫЙ КУРСОР — красный крестик (только desktop)
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

    // Расширение курсора на интерактивных элементах
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (t.closest && t.closest('a, button, [role="button"], input, textarea, .work-mini, .clip-card')) {
        cursor.classList.add('cursor-crosshair--active');
      }
    });

    document.addEventListener('mouseout', function (e) {
      var t = e.target;
      if (t.closest && t.closest('a, button, [role="button"], input, textarea, .work-mini, .clip-card')) {
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
     19. GLITCH НА СЧЁТЧИКАХ — при достижении финального значения
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

      // Если анимация уже закончилась — триггерим сразу
      if (el.textContent === finalText) {
        triggerGlitch(el);
        return;
      }

      // Иначе слушаем изменения
      var obs = new MutationObserver(function () {
        if (el.textContent === finalText) {
          triggerGlitch(el);
          obs.disconnect();
        }
      });
      obs.observe(el, { childList: true, characterData: true, subtree: true });

      // Страховка: триггерим через 3 секунды, если по какой-то причине не поймали
      setTimeout(function () {
        if (el.dataset.glitchDone !== '1') {
          triggerGlitch(el);
          obs.disconnect();
        }
      }, 3200);
    });
  })();

  /* ============================================================
     14. АДМИН-ПАНЕЛЬ — Ctrl+Shift+A
     ============================================================ */
  (function initAdmin() {
    var panel = document.getElementById('adminPanel');
    if (!panel) return;

    var API_BASE = 'https://spodzh-reviews-api.ernest-chanel.workers.dev';
    var KEY_STORAGE = 'spodzh_admin_key';

    var statsEl = panel.querySelector('#adminStats');
    var pendingEl = panel.querySelector('#adminPending');
    var refreshBtn = panel.querySelector('[data-admin-refresh]');

    function getKey() {
      var key = null;
      try { key = localStorage.getItem(KEY_STORAGE); } catch (e) {}
      if (!key) {
        key = window.prompt('ADMIN KEY:');
        if (!key) return null;
        try { localStorage.setItem(KEY_STORAGE, key); } catch (e) {}
      }
      return key;
    }

    function openPanel() {
      var key = getKey();
      if (!key) return;
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      loadStats(key);
    }

    function closePanel() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function loadStats(key) {
      // Stats
      fetch(API_BASE + '/admin/stats?key=' + encodeURIComponent(key))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.error) {
            pendingEl.innerHTML = '<div class="admin-error">⚠ ' + (data.error || 'Ошибка') + '</div>';
            return;
          }
          statsEl.querySelector('[data-admin="reviews_total"]').textContent = data.reviews_total ?? '—';
          statsEl.querySelector('[data-admin="reviews_pending"]').textContent = data.reviews_pending ?? '—';
          statsEl.querySelector('[data-admin="reviews_approved"]').textContent = data.reviews_approved ?? '—';
          statsEl.querySelector('[data-admin="videos_total"]').textContent = data.videos_total ?? '—';
        })
        .catch(function (err) {
          pendingEl.innerHTML = '<div class="admin-error">⚠ Сеть: ' + err.message + '</div>';
        });

      // Pending reviews
      fetch(API_BASE + '/admin/pending?key=' + encodeURIComponent(key))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var items = (data && data.items) || [];
          if (!items.length) {
            pendingEl.innerHTML = '<div class="admin-empty">✨ Очередь пуста</div>';
            return;
          }
          pendingEl.innerHTML = '<div class="admin-pending__head">ОЧЕРЕДЬ · ' + items.length + '</div>' +
            items.map(function (r) {
              return '<div class="admin-pending__item">' +
                '<strong>#' + r.id + ' · ' + escapeHtml(r.author) + '</strong>' +
                (r.role ? ' <em>· ' + escapeHtml(r.role) + '</em>' : '') +
                '<p>' + escapeHtml((r.text || '').slice(0, 120)) + '…</p>' +
                '</div>';
            }).join('');
        })
        .catch(function () {
          pendingEl.innerHTML = '<div class="admin-error">⚠ Не удалось загрузить очередь</div>';
        });
    }

    function escapeHtml(s) {
      return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) {
        e.preventDefault();
        if (panel.classList.contains('open')) closePanel();
        else openPanel();
      }
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        closePanel();
      }
    });

    panel.querySelectorAll('[data-admin-close]').forEach(function (el) {
      el.addEventListener('click', closePanel);
    });

    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        var key = null;
        try { key = localStorage.getItem(KEY_STORAGE); } catch (e) {}
        if (key) loadStats(key);
      });
    }
  })();

  /* ============================================================
     16. STAGGER — карточки появляются по очереди
     Работает через .stagger-parent + IntersectionObserver
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
      // Если у родителя уже нет .reveal — добавляем на месте
      if (!p.classList.contains('reveal')) {
        p.classList.add('reveal');
      }
      obs.observe(p);
    });
  })();

  console.log('%cENHANCEMENTS · loaded', 'color:#ff2d75; font-family:monospace;');
})();