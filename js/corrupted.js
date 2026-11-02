/* ============================================================
   CORRUPTED.JS v3 — пасхалка "CORRUPTED ARCHIVE"
   5 кликов по логотипу → оверлей → corrupted-mode
   ============================================================ */
(function () {
  'use strict';

  window.__spodzhCorrupted = true;

  var CLICKS_NEEDED = 5;
  var CLICK_RESET_MS = 3000;
  var STORAGE_KEY = 'spodzh_corrupted';

  var clickCount = 0;
  var clickTimer = null;
  var isActive = false;
  var overlay = null;
  var flash = null;
  var restoreBtn = null;
  var labels = [];

  function buildOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
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
    return overlay;
  }

  function buildFlash() {
    if (flash) return flash;
    flash = document.createElement('div');
    flash.className = 'corrupt-invert-flash';
    flash.setAttribute('aria-hidden', 'true');
    document.body.appendChild(flash);
    return flash;
  }

  function buildRestore() {
    if (restoreBtn) return restoreBtn;
    restoreBtn = document.createElement('button');
    restoreBtn.className = 'restore-btn';
    restoreBtn.type = 'button';
    restoreBtn.textContent = 'restore archive';
    restoreBtn.addEventListener('click', deactivate);
    document.body.appendChild(restoreBtn);
    return restoreBtn;
  }

  function addLabels() {
    var targets = document.querySelectorAll('.featured__media, .work-mini__thumb');
    targets.forEach(function (t) {
      if (t.querySelector('.corrupt-label')) return;
      var l = document.createElement('span');
      l.className = 'corrupt-label';
      l.textContent = 'corrupted';
      t.appendChild(l);
      labels.push(l);
    });
  }

  function removeLabels() {
    labels.forEach(function (l) { if (l.parentNode) l.parentNode.removeChild(l); });
    labels = [];
  }

  function activate() {
    if (isActive) return;
    isActive = true;

    var ov = buildOverlay();
    var fl = buildFlash();

    document.body.classList.add('corrupting');
    ov.classList.add('active');
    fl.classList.remove('run');
    void fl.offsetWidth;
    fl.classList.add('run');

    setTimeout(function () {
      document.body.classList.remove('corrupting');
      ov.classList.remove('active');
      fl.classList.remove('run');

      document.body.classList.add('corrupted-mode');
      buildRestore().classList.add('show');
      addLabels();

      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    }, 2200);
  }

  function deactivate() {
    if (!isActive) return;
    isActive = false;

    document.body.classList.remove('corrupted-mode');
    document.body.classList.remove('corrupting');
    if (overlay) overlay.classList.remove('active');
    if (flash) flash.classList.remove('run');
    if (restoreBtn) restoreBtn.classList.remove('show');
    removeLabels();

    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function restoreFromStorage() {
    var active = false;
    try { active = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}
    if (!active) return;
    isActive = true;
    document.body.classList.add('corrupted-mode');
    buildRestore().classList.add('show');
    addLabels();
  }

  function bindLogo() {
    var logo = document.getElementById('logoTrigger');
    if (!logo) {
      console.warn('[corrupted] #logoTrigger не найден');
      return;
    }

    logo.addEventListener('click', function (e) {
      logo.classList.remove('is-corrupting');
      void logo.offsetWidth;
      logo.classList.add('is-corrupting');
      setTimeout(function () { logo.classList.remove('is-corrupting'); }, 520);

      clickCount++;

      if (clickCount >= CLICKS_NEEDED) {
        e.preventDefault();
        e.stopPropagation();
        clickCount = 0;
        clearTimeout(clickTimer);

        if (isActive) deactivate();
        else activate();
        return;
      }

      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clickCount = 0; }, CLICK_RESET_MS);
    }, true); // capture-фаза — работает раньше smooth scroll
  }

  function init() {
    bindLogo();
    restoreFromStorage();

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isActive) deactivate();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('%c[corrupted] module loaded', 'color:#ff2222; font-family:monospace;');
})();