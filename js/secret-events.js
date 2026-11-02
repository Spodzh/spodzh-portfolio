/* ============================================================
   SECRET-EVENTS.JS — события призрака и редкие аномалии
   Версия: 1.0
   Работает поверх js/secret-console.js (window.SpodzhSecrets).
   Не дублирует обработчики призрака — только добавляет счётчики
   через capture-фазу, чтобы не мешать js/interactive.js.
   ============================================================ */
(function () {
  'use strict';

  var API = window.SpodzhSecrets;
  if (!API) {
    console.warn('[events] SpodzhSecrets не найден — модуль не активен');
    return;
  }

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = mqReduce.matches;

  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* ---------- Ограничение частоты событий ---------- */
  var EVENT_COOLDOWN_MS = 3 * 60 * 1000; // не чаще одного события раз в 3 минуты
  var lastEventAt = 0;
  var eventBusy = false;

  function canRunEvent() {
    if (reduced) return false;
    if (eventBusy) return false;
    if (Date.now() - lastEventAt < EVENT_COOLDOWN_MS) return false;
    return true;
  }

  function markEventRun(name) {
    lastEventAt = Date.now();
    try { API.markEvent('event:' + name); } catch (e) {}
  }

  /* ============================================================
     GHOST — отслеживание кликов
     Не мешает js/interactive.js: слушает на capture-фазе,
     поэтому не блокирует существующие обработчики.
     ============================================================ */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var ghost = t.closest('.ghost-corner, .hero-ghost');
    if (!ghost) return;
    try { API.bumpGhost(); } catch (err) {}
  }, true);

  /* ============================================================
     РЕПЛИКИ ПРИЗРАКА
     ============================================================ */
  var GHOST_REPLIES_NORMAL = [
    '...',
    'ты снова здесь.',
    'я помню тебя.',
    'проверь консоль.',
    'не все файлы хотят быть найденными.',
    'он не отвечает.',
    'ты слишком близко.',
    'я вижу тебя.'
  ];

  var GHOST_REPLIES_CORRUPTED = [
    'это моё место.',
    'ты видишь то, что видят они?',
    'не уходи.',
    'архив помнит тебя.',
    '...',
    'я здесь давно.'
  ];

  var GHOST_REPLIES_AFTER_PROTOCOL = [
    'протокол активен.',
    'наконец-то.',
    'теперь мы можем говорить.',
    'спроси меня в консоли.'
  ];

  function isCorrupted() {
    return document.body.classList.contains('corrupted-mode');
  }

  function isProtocolActive() {
    try {
      var p = API.progress();
      return p && p.found && p.found.indexOf('GHOST_PROTOCOL') !== -1;
    } catch (e) { return false; }
  }

  function pickReply() {
    var pool;
    if (isCorrupted()) {
      pool = GHOST_REPLIES_CORRUPTED;
    } else if (isProtocolActive() && Math.random() < 0.6) {
      pool = GHOST_REPLIES_AFTER_PROTOCOL;
    } else {
      pool = GHOST_REPLIES_NORMAL;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  var ghostBubble = null;
  var ghostBubbleTimer = null;

  function showGhostBubble(text) {
    if (ghostBubble) {
      clearTimeout(ghostBubbleTimer);
      if (ghostBubble.parentNode) ghostBubble.parentNode.removeChild(ghostBubble);
      ghostBubble = null;
    }
    var el = document.createElement('div');
    el.className = 'ghost-bubble';
    el.textContent = text;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    ghostBubble = el;

    requestAnimationFrame(function () { el.classList.add('show'); });

    ghostBubbleTimer = setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (ghostBubble === el) ghostBubble = null;
      }, 400);
    }, 3400);
  }

  // Клик по призраку — иногда говорит реплику (не всегда, чтобы не навязчиво)
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (!t.closest('.ghost-corner, .hero-ghost')) return;
    if (reduced) return;
    if (Math.random() < 0.35) {
      setTimeout(function () { showGhostBubble(pickReply()); }, 450);
    }
  }, true);

  /* ============================================================
     СОБЫТИЯ
     ============================================================ */

  // 1. SYNC_LOST — короткое дрожание страницы
  function eventSyncLost() {
    if (!canRunEvent()) return;
    markEventRun('SYNC_LOST');

    document.body.classList.add('sync-lost');
    setTimeout(function () { document.body.classList.remove('sync-lost'); }, 700);

    if (Math.random() < 0.4) {
      setTimeout(function () { showGhostBubble('синхронизация потеряна...'); }, 150);
    }
  }

  // 2. TEXT_GLITCH — глитч заголовков
  function eventTextGlitch() {
    if (!canRunEvent()) return;
    markEventRun('TEXT_GLITCH');

    var heads = document.querySelectorAll('.sec-head__title, .hero-title__main, .featured__label');
    heads.forEach(function (h) {
      h.classList.add('text-glitch');
      setTimeout(function () { h.classList.remove('text-glitch'); }, 900);
    });
  }

  // 3. RED_PULSE — мягкая красная вспышка поверх страницы
  function eventRedPulse() {
    if (!canRunEvent()) return;
    markEventRun('RED_PULSE');

    var overlay = document.createElement('div');
    overlay.className = 'red-pulse-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    requestAnimationFrame(function () { overlay.classList.add('run'); });

    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 1400);
  }

  // 4. GHOST_MISSING — призрак исчезает на 8 секунд
  function eventGhostMissing() {
    if (!canRunEvent()) return;
    if (!isProtocolActive()) return;
    markEventRun('GHOST_MISSING');

    var ghosts = document.querySelectorAll('.ghost-corner, .hero-ghost');
    if (!ghosts.length) return;

    ghosts.forEach(function (g) { g.classList.add('is-missing'); });

    setTimeout(function () {
      ghosts.forEach(function (g) { g.classList.remove('is-missing'); });
      setTimeout(function () { showGhostBubble('я вернулся. или нет?'); }, 700);
    }, 8000);
  }

  // 5. FILE_DROP — всплывашка с «обнаруженным» файлом
  function eventFileDrop() {
    if (!canRunEvent()) return;
    markEventRun('FILE_DROP');

    var num = 100 + Math.floor(Math.random() * 900);
    var fileNum = String(num);
    var names = ['DROP', 'NOISE', 'TRACE', 'SIGNAL', 'FRAGMENT', 'MEMORY'];
    var name = names[Math.floor(Math.random() * names.length)] + '_' + fileNum;

    var el = document.createElement('div');
    el.className = 'file-drop';
    el.setAttribute('aria-hidden', 'true');

    var dot = document.createElement('span');
    dot.className = 'file-drop__dot';

    var text = document.createElement('span');
    text.className = 'file-drop__text';
    text.textContent = 'FILE_' + fileNum + ' · ' + name;

    var tag = document.createElement('span');
    tag.className = 'file-drop__tag';
    tag.textContent = 'DETECTED';

    el.appendChild(dot);
    el.appendChild(text);
    el.appendChild(tag);
    document.body.appendChild(el);

    requestAnimationFrame(function () { el.classList.add('show'); });

    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 400);
    }, 5500);
  }

  /* ============================================================
     ТРИГГЕРЫ
     ============================================================ */

  // Триггер 1: скролл до футера → SYNC_LOST или FILE_DROP (один раз за сессию)
  var footerTriggered = false;
  var footerEl = document.querySelector('.footer');
  if (footerEl && 'IntersectionObserver' in window) {
    var footerObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !footerTriggered) {
          footerTriggered = true;
          setTimeout(function () {
            if (Math.random() < 0.5) eventFileDrop();
            else eventSyncLost();
          }, 900);
        }
      });
    }, { threshold: 0.3 });
    footerObs.observe(footerEl);
  }

  // Триггер 2: бездействие 60 секунд → RED_PULSE
  var idleTimer = null;
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { eventRedPulse(); }, 60000);
  }
  ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, resetIdle, { passive: true });
  });
  resetIdle();

  // Триггер 3: случайное событие раз в 4–8 минут
  function scheduleRandom() {
    var delay = 4 * 60 * 1000 + Math.random() * 4 * 60 * 1000;
    setTimeout(function () {
      if (document.visibilityState === 'visible') {
        var pool = [eventSyncLost, eventTextGlitch, eventFileDrop];
        if (isProtocolActive()) pool.push(eventGhostMissing);
        var fn = pool[Math.floor(Math.random() * pool.length)];
        try { fn(); } catch (e) {}
      }
      scheduleRandom();
    }, delay);
  }
  scheduleRandom();

  // Триггер 4: вход в corrupted mode → короткий TEXT_GLITCH
  var lastCorrupted = isCorrupted();
  if ('MutationObserver' in window) {
    var bodyObs = new MutationObserver(function () {
      var now = isCorrupted();
      if (now && !lastCorrupted) {
        setTimeout(eventTextGlitch, 300);
      }
      lastCorrupted = now;
    });
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // Триггер 5: 10 кликов на призрака за 30 секунд → GHOST_MISSING
  var ghostClickCount = 0;
  var ghostClickTimer = null;
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (!t.closest('.ghost-corner, .hero-ghost')) return;
    ghostClickCount++;
    clearTimeout(ghostClickTimer);
    if (ghostClickCount >= 10 && isProtocolActive()) {
      ghostClickCount = 0;
      setTimeout(eventGhostMissing, 500);
      return;
    }
    ghostClickTimer = setTimeout(function () { ghostClickCount = 0; }, 30000);
  }, true);

  // Реакция на изменение prefers-reduced-motion в рантайме
  mqReduce.addEventListener && mqReduce.addEventListener('change', function (e) {
    reduced = e.matches;
  });

  console.log('%c[events] module loaded', 'color:#ff2d75; font-family:monospace;');
})();