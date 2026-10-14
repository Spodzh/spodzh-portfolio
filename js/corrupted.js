/* ============================================================
   CORRUPTED.JS — пасхалка "CORRUPTED ARCHIVE"
   5 кликов по логотипу → взлом → альтернативный режим.
   С негатив-эффектом при активации и восстановлении.
   ============================================================ */
(function () {
  'use strict';

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion = mqReduce.matches;

  var CLICKS_REQUIRED = 5;
  var RESET_DELAY = 3000;

  var clickCount = 0;
  var resetTimer = null;
  var isCorrupting = false;
  var isCorrupted = false;

  var logo = document.getElementById('logoTrigger') || document.querySelector('.logo');
  if (!logo) {
    console.warn('[corrupted] Логотип не найден');
    return;
  }

  /* ---------- ОВЕРЛЕЙ ВЗЛОМА ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'corrupt-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<div class="corrupt-noise"></div>' +
    '<div class="corrupt-bars">' +
      '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>' +
    '</div>' +
    '<div class="corrupt-messages">' +
      '<span>UNAUTHORIZED ACCESS</span>' +
      '<span>SIGNAL LOST</span>' +
      '<span>ARCHIVE COMPROMISED</span>' +
      '<span>SYSTEM OVERRIDDEN</span>' +
    '</div>';
  document.body.appendChild(overlay);

  /* ---------- КНОПКА ВОССТАНОВЛЕНИЯ ---------- */
  var restoreBtn = document.createElement('button');
  restoreBtn.type = 'button';
  restoreBtn.className = 'restore-btn';
  restoreBtn.textContent = 'RESTORE ORIGINAL ARCHIVE';
  restoreBtn.setAttribute('aria-label', 'Восстановить оригинальный архив');
  document.body.appendChild(restoreBtn);

  /* ---------- УТИЛИТА: негатив-флеш ---------- */
  function runInvertFlash(duration) {
    if (reducedMotion) return;
    var flash = document.createElement('div');
    flash.className = 'corrupt-invert-flash run';
    document.body.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, duration || 1400);
  }

  /* ---------- ОТКЛИК ЛОГОТИПА ---------- */
  function pulseLogo() {
    logo.classList.remove('is-corrupting');
    void logo.offsetWidth;
    logo.classList.add('is-corrupting');
    setTimeout(function () {
      logo.classList.remove('is-corrupting');
    }, 520);
  }

  /* ---------- АКТИВАЦИЯ ПАСХАЛКИ ---------- */
  function startCorruption() {
    if (isCorrupting) return;
    isCorrupting = true;

    document.body.classList.add('corrupting');
    pulseLogo();

    var duration = reducedMotion ? 800 : 2200;

    // Оверлей включается с небольшой задержкой
    setTimeout(function () {
      overlay.classList.add('active');
    }, reducedMotion ? 0 : 100);

    // Финальный переход
    setTimeout(function () {
      document.body.classList.remove('corrupting');
      document.body.classList.add('corrupted-mode');
      overlay.classList.remove('active');
      restoreBtn.classList.add('show');

      // НЕГАТИВ-ФЛЕШ — резкая вспышка поверх всей страницы
      runInvertFlash(1400);

      injectCorruptMarks();

      isCorrupting = false;
      isCorrupted = true;
      clickCount = 0;
    }, duration);
  }

  /* ---------- ВОССТАНОВЛЕНИЕ ОРИГИНАЛА ---------- */
  function restoreOriginal() {
    if (isCorrupting) return;
    isCorrupting = true;

    document.body.classList.add('corrupting');

    setTimeout(function () {
      document.body.classList.remove('corrupted-mode');
      document.body.classList.remove('corrupting');
      restoreBtn.classList.remove('show');
      removeCorruptMarks();

      // Негатив-флеш и при восстановлении
      runInvertFlash(1400);

      isCorrupting = false;
      isCorrupted = false;
      clickCount = 0;
    }, reducedMotion ? 300 : 700);
  }

  /* ---------- МЕТКИ-ЦЕНЗУРЫ НА ПРЕВЬЮ ---------- */
  var corruptMarkNodes = [];
  var corruptObserver = null;

  function injectCorruptMarks() {
    if (reducedMotion) return;

    var labels = [
      'FILE_001 // RECOVERED',
      'CUT_02 // CORRUPTED',
      'SUBJECT: UNKNOWN',
      'VISUAL DATA DAMAGED',
      'ACCESS DENIED',
      '[REDACTED]',
      'NO SIGNAL',
      'TRACKING LOST'
    ];

    function apply() {
      var thumbs = document.querySelectorAll(
        '.tile__thumb, .featured__media, .photo-censor__media'
      );

      thumbs.forEach(function (th, i) {
        if (th.querySelector('.corrupt-label')) return;
        var el = document.createElement('span');
        el.className = 'corrupt-label';
        el.textContent = labels[i % labels.length];
        el.setAttribute('aria-hidden', 'true');
        th.appendChild(el);
        corruptMarkNodes.push(el);
      });

      // Меняем метки в заголовках секций
      var secHeads = document.querySelectorAll('.sec-head__num');
      secHeads.forEach(function (sh, i) {
        if (sh.dataset.corrupt === '1') return;
        sh.dataset.originalText = sh.textContent;
        sh.dataset.corrupt = '1';
        if (i % 2 === 0) {
          sh.textContent = '[ CLASSIFIED ] // ' + sh.textContent;
        }
      });
    }

    apply();

    // Следим за перерисовкой сетки проектов (renderTiles обновляет DOM)
    var tilesRoot = document.getElementById('projectsTiles');
    if (tilesRoot && 'MutationObserver' in window) {
      if (corruptObserver) corruptObserver.disconnect();
      corruptObserver = new MutationObserver(function () {
        setTimeout(apply, 60);
      });
      corruptObserver.observe(tilesRoot, { childList: true });
    }
  }

  function removeCorruptMarks() {
    if (corruptObserver) {
      corruptObserver.disconnect();
      corruptObserver = null;
    }
    corruptMarkNodes.forEach(function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });
    corruptMarkNodes = [];

    document.querySelectorAll('.sec-head__num').forEach(function (sh) {
      if (sh.dataset.corrupt === '1' && sh.dataset.originalText) {
        sh.textContent = sh.dataset.originalText;
        delete sh.dataset.originalText;
        delete sh.dataset.corrupt;
      }
    });
  }

  /* ---------- КЛИКИ ПО ЛОГОТИПУ ---------- */
  logo.addEventListener('click', function (e) {
    clickCount++;
    pulseLogo();

    // Уже в corrupted — клики ведут к восстановлению
    if (isCorrupted) {
      if (clickCount >= CLICKS_REQUIRED) {
        e.preventDefault();
        clickCount = 0;
        clearTimeout(resetTimer);
        restoreOriginal();
        return;
      }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () { clickCount = 0; }, RESET_DELAY);
      return;
    }

    // Обычный режим — 5 кликов активируют взлом
    if (clickCount >= CLICKS_REQUIRED) {
      e.preventDefault();
      clickCount = 0;
      clearTimeout(resetTimer);
      startCorruption();
      return;
    }

    clearTimeout(resetTimer);
    resetTimer = setTimeout(function () { clickCount = 0; }, RESET_DELAY);
  });

  /* ---------- КНОПКА ВОССТАНОВЛЕНИЯ ---------- */
  restoreBtn.addEventListener('click', restoreOriginal);

  /* ---------- ESC ВОССТАНАВЛИВАЕТ ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isCorrupted) {
      restoreOriginal();
    }
  });

  /* ---------- ОТЛАДКА ---------- */
  window.__spodzhCorrupted = {
    activate: startCorruption,
    restore: restoreOriginal,
    isActive: function () { return isCorrupted; }
  };

  console.log(
    '%cПасхалка: 5 кликов по логотипу. Отладка: __spodzhCorrupted.activate()',
    'color:#c81018; font-size:11px; font-family:monospace;'
  );
})();