/* ============================================================
   STORY-SECRETS.JS — секретные элементы в story.html
   Версия: 1.0
   Читает прогресс из localStorage, показывает скрытые главы
   ============================================================ */
(function () {
  'use strict';

  var PROGRESS_KEY = 'spodzh_secrets_v1';

  function loadProgress() {
    try {
      var raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function has(id) {
    var p = loadProgress();
    if (!p || !Array.isArray(p.found)) return false;
    return p.found.indexOf(id) !== -1;
  }

  function markEvent(name) {
    try {
      var p = loadProgress();
      if (!p) return;
      if (!Array.isArray(p.events)) p.events = [];
      if (p.events.indexOf(name) === -1) {
        p.events.push(name);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
      }
    } catch (e) {}
  }

  function showStoryToast(text) {
    var el = document.createElement('div');
    el.className = 'story-toast';
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
    }, 3200);
  }

  function scrollToChapter(id) {
    var canvas = document.getElementById('psCanvas');
    var target = document.getElementById(id);
    if (!canvas || !target) return;
    var canvasTop = canvas.getBoundingClientRect().top;
    var targetTop = target.getBoundingClientRect().top;
    var offset = targetTop - canvasTop + canvas.scrollTop - 60;
    canvas.scrollTo({ top: offset, behavior: 'smooth' });
  }

  function unlockHiddenChapter() {
    var hidden = document.getElementById('chapter_089');
    if (!hidden) return;
    hidden.hidden = false;

    var layersWrap = document.querySelector('.ps-layers');
    if (!layersWrap) return;
    if (layersWrap.querySelector('[data-target="chapter_089"]')) return;

    var outro = layersWrap.querySelector('[data-target="story_outro"]');
    var newLayer = document.createElement('div');
    newLayer.className = 'ps-layer is-secret';
    newLayer.setAttribute('data-target', 'chapter_089');
    newLayer.innerHTML =
      '<span class="ps-layer__eye">👁</span>' +
      '<span class="ps-layer__thumb"><span>89</span></span>' +
      '<span class="ps-layer__name">FILE_089_скрытая_глава</span>';

    if (outro) layersWrap.insertBefore(newLayer, outro);
    else layersWrap.appendChild(newLayer);

    newLayer.addEventListener('click', function () {
      scrollToChapter('chapter_089');
    });
  }

  function injectSecretLine() {
    var chapter7 = document.getElementById('chapter_07');
    if (!chapter7) return;
    if (chapter7.querySelector('.story-secret-line')) return;

    var secretLine = document.createElement('p');
    secretLine.className = 'story-secret-line';
    var em = document.createElement('em');
    em.textContent = '// фрагмент восстановлен из повреждённого файла:';
    secretLine.appendChild(em);
    secretLine.appendChild(document.createTextNode(
      ' между строк 2022 и 2023 был ещё один год. я его не помню. кажется, я тогда ничего не снимал.'
    ));
    chapter7.appendChild(secretLine);
  }

  function bindLogoToast() {
    var logo = document.querySelector('.ps-logo');
    if (!logo) return;
    var count = 0, timer = null;
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function () {
      count++;
      clearTimeout(timer);
      if (count >= 5) {
        count = 0;
        showStoryToast('...Ps не отвечает. попробуй в другом месте.');
        return;
      }
      timer = setTimeout(function () { count = 0; }, 3000);
    });
  }

  function markStoryCompleted() {
    var canvas = document.getElementById('psCanvas');
    var outro = document.getElementById('story_outro');
    if (!canvas || !outro || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          markEvent('story_completed');
          obs.disconnect();
        }
      });
    }, { root: canvas, threshold: 0.5 });
    obs.observe(outro);
  }

  function addFinaleBadge() {
    var p = loadProgress();
    if (!p || !p.finale_seen) return;
    var status = document.querySelector('.ps-statusbar');
    if (!status) return;
    if (status.querySelector('.ps-finale-badge')) return;
    var badge = document.createElement('span');
    badge.className = 'ps-finale-badge';
    badge.textContent = '· ARCHIVE_COMPLETE';
    status.appendChild(badge);
  }

  function init() {
    if (has('END_OF_FILE')) unlockHiddenChapter();
    if (has('BROKEN_TIMELINE')) injectSecretLine();
    bindLogoToast();
    markStoryCompleted();
    addFinaleBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('%c[story-secrets] module loaded', 'color:#00e5ff; font-family:monospace;');
})();