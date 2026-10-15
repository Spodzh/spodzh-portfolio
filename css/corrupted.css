/* ============================================================
   CORRUPTED.JS v2 — пасхалка "CORRUPTED ARCHIVE"
   5 кликов по логотипу → взлом → альтернативная тема.
   Стили — в css/corrupted.css.
   ============================================================ */
(function () {
  'use strict';

  window.__spodzhCorrupted = true;

  var STORAGE_KEY = 'spodzh_corrupted';

  var state = {
    clicks: 0,
    timer: null,
    active: false,
    overlay: null,
    flash: null,
    restoreBtn: null,
    labels: []
  };

  function ensureOverlay() {
    if (state.overlay) return state.overlay;
    var overlay = document.createElement('div');
    overlay.className = 'corrupt-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="corrupt-noise"></div>' +
      '<div class="corrupt-bars">' +
        '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>' +
      '</div>' +
      '<div class="corrupt-messages">' +
        '<span>SCANNING_ARCHIVE...</span>' +
        '<span>BYTES_CORRUPTED: 84%</span>' +
        '<span>REWRITING_STYLESHEET...</span>' +
        '<span>CORRUPTED</span>' +
      '</div>';
    document.body.appendChild(overlay);
    state.overlay = overlay;
    return overlay;
  }

  function ensureFlash() {
    if (state.flash) return state.flash;
    var f = document.createElement('div');
    f.className = 'corrupt-invert-flash';
    f.setAttribute('aria-hidden', 'true');
    document.body.appendChild(f);
    state.flash = f;
    return f;
  }

  function ensureRestore() {
    if (state.restoreBtn) return state.restoreBtn;
    var b = document.createElement('button');
    b.className = 'restore-btn';
    b.type = 'button';
    b.textContent = 'restore archive';
    b.addEventListener('click', deactivate);
    document.body.appendChild(b);
    state.restoreBtn = b;
    return b;
  }

  function injectLabels() {
    var targets = document.querySelectorAll('.featured__media, .work-mini__thumb');
    targets.forEach(function (t) {
      if (t.querySelector('.corrupt-label')) return;
      var label = document.createElement('span');
      label.className = 'corrupt-label';
      label.textContent = 'corrupted';
      t.appendChild(label);
      state.labels.push(label);
    });
  }

  function removeLabels() {
    state.labels.forEach(function (l) {
      if (l.parentNode) l.parentNode.removeChild(l);
    });
    state.labels = [];
  }

  function activate() {
    if (state.active) return;
    state.active = true;

    var overlay = ensureOverlay();
    var flash = ensureFlash();

    document.body.classList.add('corrupting');
    overlay.classList.add('active');
    flash.classList.remove('run');
    void flash.offsetWidth;
    flash.classList.add('run');

    setTimeout(function () {
      document.body.classList.remove('corrupting');
      overlay.classList.remove('active');
      flash.classList.remove('run');
      document.body.classList.add('corrupted-mode');
      var rb = ensureRestore();
      rb.classList.add('show');
      injectLabels();
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    }, 2200);
  }

  function deactivate() {
    if (!state.active) return;
    state.active = false;
    document.body.classList.remove('corrupted-mode');
    document.body.classList.remove('corrupting');
    if (state.overlay) state.overlay.classList.remove('active');
    if (state.restoreBtn) state.restoreBtn.classList.remove('show');
    removeLabels();
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function bindLogo() {
    var logo = document.getElementById('logoTrigger');
    if (!logo) return;

    logo.addEventListener('click', function (e) {
      logo.classList.remove('is-corrupting');
      void logo.offsetWidth;
      logo.classList.add('is-corrupting');
      setTimeout(function () { logo.classList.remove('is-corrupting'); }, 520);

      state.clicks++;
      if (state.clicks >= 5) {
        e.preventDefault();
        state.clicks = 0;
        clearTimeout(state.timer);
        if (state.active) deactivate();
        else activate();
        return;
      }
      clearTimeout(state.timer);
      state.timer = setTimeout(function () { state.clicks = 0; }, 3000);
    });
  }

  function restoreFromStorage() {
    var wasActive = false;
    try { wasActive = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}
    if (!wasActive) return;
    state.active = true;
    document.body.classList.add('corrupted-mode');
    var rb = ensureRestore();
    rb.classList.add('show');
    injectLabels();
  }

  function init() {
    bindLogo();
    restoreFromStorage();
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.active) deactivate();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();