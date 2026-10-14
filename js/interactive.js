/* ============================================================
   INTERACTIVE.JS — V3 (FINAL, с встроенным CSS)
   Дудлы, призрак, пасхалка, цензура, глитч.
   ВАЖНО: критический CSS инжектится прямо отсюда,
   чтобы сайт работал, даже если css/interactive.css не подключён.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     ВСТРОЕННЫЙ КРИТИЧЕСКИЙ CSS
     Гарантирует правильные размеры и позиции призрака и дудлов
     даже если файл css/interactive.css отсутствует.
     ============================================================ */
  var CRITICAL_CSS = [
    /* --- Призрак в углу --- */
    '.ghost-corner{position:fixed !important;bottom:28px !important;right:28px !important;',
    'width:62px !important;height:62px !important;max-width:62px !important;max-height:62px !important;',
    'z-index:950 !important;cursor:pointer;opacity:0;transform:translateY(20px);',
    'transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1);',
    'display:block !important;overflow:visible !important;}',
    '.ghost-corner.show{opacity:1 !important;transform:translateY(0) !important;}',
    '.ghost-corner img{width:62px !important;height:62px !important;max-width:62px !important;max-height:62px !important;',
    'object-fit:contain !important;display:block !important;',
    'filter:drop-shadow(0 0 14px rgba(74,155,168,.65)) drop-shadow(0 0 28px rgba(255,34,34,.3));',
    'transition:filter .3s;}',
    '.ghost-corner:hover img{filter:drop-shadow(0 0 22px rgba(255,34,34,.85)) drop-shadow(0 0 44px rgba(255,34,34,.5));}',
    '.ghost-corner__hint{position:absolute;bottom:100%;right:0;margin-bottom:12px;',
    'padding:8px 14px;background:#14141a;border:1px solid rgba(242,237,227,.25);',
    'color:#ffd93d;font-family:"Caveat",cursive;font-size:1.15rem;white-space:nowrap;',
    'opacity:0;transform:translateY(6px);transition:opacity .3s,transform .3s;pointer-events:none;',
    'box-shadow:0 0 20px rgba(0,0,0,.6);}',
    '.ghost-corner:hover .ghost-corner__hint{opacity:1;transform:translateY(0);}',

    /* --- Дудлы: базовые размеры-страховки --- */
    '.doodle-item{position:absolute;pointer-events:none;opacity:0;',
    'transition:opacity .7s cubic-bezier(.22,1,.36,1);z-index:4;',
    'max-width:120px;max-height:80px;}',
    '.doodle-item.visible{opacity:1;}',
    '.doodle-item svg{width:100%;height:100%;overflow:visible;display:block;max-width:100%;}',
    '.doodle-item .draw{fill:none;stroke-linecap:round;stroke-linejoin:round;',
    'stroke-dasharray:1;stroke-dashoffset:1;',
    'transition:stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1);}',
    '.doodle-item.visible .draw{stroke-dashoffset:0;}',
    '.doodle-item .draw--delay{transition-delay:.4s;}',
    '.doodle-item--hand{font-family:"Caveat",cursive;font-weight:700;',
    'color:#ffd93d;font-size:1.5rem;line-height:1;white-space:nowrap;',
    'max-width:none;max-height:none;',
    'transform:rotate(var(--rot,-4deg));text-shadow:0 0 20px rgba(255,217,61,.35);}',
    '.doodle-item--hand.doodle-note-hero{--rot:-6deg;}',
    '.doodle-item--hand.doodle-note-about{--rot:4deg;}',
    '.doodle-item--hand.doodle-note-work{--rot:-3deg;}',
    '.doodle-item--hand.doodle-note-services{--rot:5deg;}',
    '.doodle-item--hand.doodle-note-contact{--rot:-5deg;}',

    /* Позиции */
    '.doodle-arrow-hero{top:20%;right:3%;width:96px;height:56px;}',
    '.doodle-arrow-work{top:6%;right:44%;width:76px;height:44px;}',
    '.doodle-note-hero{top:16%;right:2%;}',
    '.doodle-note-about{top:5%;right:3%;}',
    '.doodle-note-work{top:3%;right:3%;}',
    '.doodle-note-services{top:5%;right:3%;}',
    '.doodle-note-contact{top:5%;right:3%;}',
    '.doodle-star-1{top:40%;left:3%;width:32px;height:32px;}',
    '.doodle-star-2{bottom:12%;right:4%;width:26px;height:26px;}',
    '.doodle-cross-1{bottom:8%;left:4%;width:24px;height:24px;}',

    /* --- Секции проектов должны быть relative --- */
    '.projects-new{position:relative;}',

    /* --- Мобильные дудлы --- */
    '@media (max-width:767px){',
    '.doodle-arrow-hero,.doodle-arrow-work,.doodle-star-1,.doodle-star-2,.doodle-cross-1{display:none !important;}',
    '.doodle-item--hand{font-size:1.2rem;}',
    '.ghost-corner{width:52px !important;height:52px !important;max-width:52px !important;max-height:52px !important;bottom:18px !important;right:18px !important;}',
    '.ghost-corner img{width:52px !important;height:52px !important;max-width:52px !important;max-height:52px !important;}',
    '.ghost-corner__hint{display:none;}',
    '}',

    /* --- Глитч-флеш --- */
    '.glitch-flash{position:fixed;inset:0;z-index:9990;pointer-events:none;opacity:0;',
    'background:linear-gradient(90deg,transparent 0,rgba(255,34,34,.32) 22%,transparent 24%),',
    'linear-gradient(90deg,transparent 76%,rgba(74,155,168,.32) 78%,transparent 80%);',
    'mix-blend-mode:screen;}',
    '.glitch-flash.run{animation:glitchFlash .34s steps(3);}',
    '@keyframes glitchFlash{0%{opacity:0;transform:translateX(0);}',
    '25%{opacity:1;transform:translateX(-7px);}50%{opacity:.6;transform:translateX(5px);}',
    '75%{opacity:.3;transform:translateX(-2px);}100%{opacity:0;transform:translateX(0);}}',

    /* --- Пиксель-цензура --- */
    '.tile__thumb .pixel-censor,.featured__media .pixel-censor{position:absolute;inset:0;z-index:3;',
    'pointer-events:none;display:grid;grid-template-columns:repeat(10,1fr);',
    'grid-template-rows:repeat(8,1fr);opacity:0;transition:opacity .15s;}',
    '.tile:hover .tile__thumb .pixel-censor,.featured:hover .featured__media .pixel-censor{opacity:1;}',
    '.pixel-censor i{background:#000;display:block;opacity:0;}',
    '.tile:hover .tile__thumb .pixel-censor i,.featured:hover .featured__media .pixel-censor i{',
    'animation:pixelCell 700ms steps(2) 1;}',
    '@keyframes pixelCell{0%{opacity:1;}45%{opacity:0;}60%{opacity:.7;}100%{opacity:0;}}',
    '@media (hover:none),(pointer:coarse){.tile__thumb .pixel-censor,.featured__media .pixel-censor{display:none;}}',

    /* --- Призрачные wiggle-анимации --- */
    '@keyframes ghostWiggle{0%,100%{transform:rotate(0) scale(1);}',
    '20%{transform:rotate(-16deg) scale(1.08);}45%{transform:rotate(14deg) scale(1.14);}',
    '70%{transform:rotate(-8deg) scale(1.06);}100%{transform:rotate(0) scale(1);}}',
    '@keyframes ghostFlip{0%{transform:rotate(0) scale(1);}50%{transform:rotate(180deg) scale(1.18);}100%{transform:rotate(360deg) scale(1);}}',
    '@keyframes ghostPixel{0%,100%{filter:none;}40%{filter:blur(2px) contrast(3) saturate(0);}70%{filter:blur(0) contrast(2) hue-rotate(90deg);}}',
    '.ghost-corner.is-wiggling{animation:ghostWiggle .9s ease-in-out;}',
    '.ghost-corner.is-flipping{animation:ghostFlip .95s cubic-bezier(.22,1,.36,1);}',
    '.ghost-corner.is-pixel{animation:ghostPixel .9s steps(6);}',

    /* --- На всякий случай: прелоадер точно должен исчезнуть --- */
    '.loader.hidden,.loader[style*="display: none"]{display:none !important;}',
    '.loader{max-height:100vh;overflow:hidden;}',
    '.loader-logo{max-width:110px !important;max-height:110px !important;width:110px !important;height:110px !important;}'
  ].join('');

  try {
    var styleTag = document.createElement('style');
    styleTag.setAttribute('data-source', 'interactive.js');
    styleTag.textContent = CRITICAL_CSS;
    document.head.appendChild(styleTag);
  } catch (e) {
    console.warn('critical css inject failed:', e);
  }

  /* ============================================================
     ДАЛЬШЕ — ЛОГИКА (без изменений)
     ============================================================ */

  var mqTouch = window.matchMedia('(hover: none) and (pointer: coarse)');
  var mqMobile = window.matchMedia('(max-width: 767px)');
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var isTouch = mqTouch.matches;
  var isMobile = mqMobile.matches;
  var reducedMotion = mqReduce.matches;

  /* ------------------------------------------------------------
     УБИРАЕМ ПРЕЛОАДЕР НА ВСЯКИЙ СЛУЧАЙ
     Если CSS не подгрузился и .loader висит — прячем его принудительно.
     ------------------------------------------------------------ */
  function killLoader() {
    var loader = document.getElementById('loader');
    if (!loader) return;
    loader.classList.add('hidden');
    setTimeout(function () {
      if (loader.parentNode) {
        loader.style.display = 'none';
      }
    }, 500);
  }

  // Гарантированно скрываем лоадер через 2.2 сек
  setTimeout(killLoader, 2200);
  window.addEventListener('load', function () {
    setTimeout(killLoader, 800);
  });

  /* ------------------------------------------------------------
     ДУДЛЫ
     ------------------------------------------------------------ */
  function initDoodles() {
    try {
      var doodles = [
        { target: '#home', cls: 'doodle-item doodle-arrow-hero',
          svg: '<svg viewBox="0 0 96 56" xmlns="http://www.w3.org/2000/svg"><path class="draw" d="M6 46 C 30 34, 60 22, 90 8" stroke="#ffd93d" stroke-width="2.6" pathLength="1"/><path class="draw draw--delay" d="M76 4 L 90 8 L 82 22" stroke="#ffd93d" stroke-width="2.6" pathLength="1"/></svg>' },
        { target: '#home', cls: 'doodle-item doodle-item--hand doodle-note-hero', text: 'do not skip →' },
        { target: '#about', cls: 'doodle-item doodle-item--hand doodle-note-about', text: 'raw material ↴' },
        { target: '#about', cls: 'doodle-item doodle-star-1',
          svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path class="draw" d="M20 3 L23.5 16 L36 18 L26.5 26 L28 39 L20 31 L12 39 L13.5 26 L4 18 L16.5 16 Z" stroke="#ffd93d" stroke-width="2" pathLength="1"/></svg>' },
        { target: '#skills', cls: 'doodle-item doodle-cross-1',
          svg: '<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path class="draw" d="M4 4 L26 26" stroke="#ffd93d" stroke-width="2.4" pathLength="1"/><path class="draw draw--delay" d="M26 4 L4 26" stroke="#ffd93d" stroke-width="2.4" pathLength="1"/></svg>' },
        { target: '#projects', cls: 'doodle-item doodle-arrow-work',
          svg: '<svg viewBox="0 0 76 44" xmlns="http://www.w3.org/2000/svg"><path class="draw" d="M4 38 C 24 28, 44 18, 70 6" stroke="#ff2222" stroke-width="2.4" pathLength="1"/><path class="draw draw--delay" d="M58 4 L 72 6 L 66 18" stroke="#ff2222" stroke-width="2.4" pathLength="1"/></svg>' },
        { target: '#projects', cls: 'doodle-item doodle-item--hand doodle-note-work', text: 'this one hits different' },
        { target: '#services', cls: 'doodle-item doodle-item--hand doodle-note-services', text: 'pick me ✓' },
        { target: '#services', cls: 'doodle-item doodle-star-2',
          svg: '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path class="draw" d="M20 3 L23.5 16 L36 18 L26.5 26 L28 39 L20 31 L12 39 L13.5 26 L4 18 L16.5 16 Z" stroke="#4a9ba8" stroke-width="2" pathLength="1"/></svg>' },
        { target: '#contacts', cls: 'doodle-item doodle-item--hand doodle-note-contact', text: 'say hi ✎' }
      ];

      doodles.forEach(function (d) {
        var target = document.querySelector(d.target);
        if (!target) return;

        var el = document.createElement('div');
        el.className = d.cls;
        el.setAttribute('aria-hidden', 'true');

        if (d.svg) el.innerHTML = d.svg;
        else if (d.text) el.textContent = d.text;

        // Инлайн-страховки, чтобы даже без CSS дудл не растянулся
        if (d.text) {
          el.style.fontFamily = "'Caveat', cursive";
          el.style.color = '#ffd93d';
          el.style.fontSize = '1.5rem';
          el.style.whiteSpace = 'nowrap';
          el.style.maxWidth = 'none';
        }

        target.appendChild(el);
      });

      var els = document.querySelectorAll('.doodle-item');
      if (!els.length) return;

      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
        els.forEach(function (el) { obs.observe(el); });
      } else {
        els.forEach(function (el) { el.classList.add('visible'); });
      }
    } catch (e) { console.warn('doodles:', e); }
  }

  /* ------------------------------------------------------------
     ПРИЗРАК-МАСКОТ
     ------------------------------------------------------------ */
  function initGhost() {
    try {
      var ghost = document.createElement('div');
      ghost.className = 'ghost-corner';
      ghost.setAttribute('role', 'button');
      ghost.setAttribute('aria-label', 'Призрак Spodzh');

      // Инлайн-стили как САМАЯ ГЛАВНАЯ страховка
      ghost.style.position = 'fixed';
      ghost.style.bottom = '28px';
      ghost.style.right = '28px';
      ghost.style.width = '62px';
      ghost.style.height = '62px';
      ghost.style.maxWidth = '62px';
      ghost.style.maxHeight = '62px';
      ghost.style.zIndex = '950';
      ghost.style.cursor = 'pointer';
      ghost.style.opacity = '0';
      ghost.style.transform = 'translateY(20px)';
      ghost.style.transition = 'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)';
      ghost.style.display = 'block';

      var img = document.createElement('img');
      img.src = 'https://i.ibb.co/G46gG6hM/SPODZHLOGO.png';
      img.alt = '';
      img.style.width = '62px';
      img.style.height = '62px';
      img.style.maxWidth = '62px';
      img.style.maxHeight = '62px';
      img.style.objectFit = 'contain';
      img.style.display = 'block';
      img.style.filter = 'drop-shadow(0 0 14px rgba(74,155,168,.65)) drop-shadow(0 0 28px rgba(255,34,34,.3))';

      var hint = document.createElement('span');
      hint.className = 'ghost-corner__hint';
      hint.textContent = 'нажми на меня 👻';
      hint.style.position = 'absolute';
      hint.style.bottom = '100%';
      hint.style.right = '0';
      hint.style.marginBottom = '12px';
      hint.style.padding = '8px 14px';
      hint.style.background = '#14141a';
      hint.style.border = '1px solid rgba(242,237,227,.25)';
      hint.style.color = '#ffd93d';
      hint.style.fontFamily = "'Caveat', cursive";
      hint.style.fontSize = '1.15rem';
      hint.style.whiteSpace = 'nowrap';
      hint.style.opacity = '0';
      hint.style.transform = 'translateY(6px)';
      hint.style.transition = 'opacity .3s, transform .3s';
      hint.style.pointerEvents = 'none';
      hint.style.boxShadow = '0 0 20px rgba(0,0,0,.6)';

      ghost.appendChild(hint);
      ghost.appendChild(img);
      document.body.appendChild(ghost);

      var shown = false;
      function showGhost() {
        if (!shown) {
          shown = true;
          ghost.classList.add('show');
          ghost.style.opacity = '1';
          ghost.style.transform = 'translateY(0)';
        }
      }

      window.addEventListener('scroll', function () {
        if (window.scrollY > 250) showGhost();
      }, { passive: true });

      setTimeout(showGhost, 6000);

      ghost.addEventListener('mouseenter', function () {
        hint.style.opacity = '1';
        hint.style.transform = 'translateY(0)';
      });
      ghost.addEventListener('mouseleave', function () {
        hint.style.opacity = '0';
        hint.style.transform = 'translateY(6px)';
      });

      var messages = {
        home: 'нажми на меня 👻',
        about: 'знакомимся',
        skills: 'это я умею',
        projects: 'клик по кадру',
        services: 'закажи что-нибудь',
        contacts: 'пиши, не бойся'
      };

      if ('IntersectionObserver' in window) {
        var sections = document.querySelectorAll('section[id]');
        var secObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var msg = messages[entry.target.id];
              if (msg) hint.textContent = msg;
            }
          });
        }, { threshold: 0.4 });
        sections.forEach(function (s) { secObs.observe(s); });
      }

      var clickCount = 0;
      var clickTimer = null;
      var anims = ['is-wiggling', 'is-flipping', 'is-pixel'];

      ghost.addEventListener('click', function () {
        clickCount++;
        var a = anims[Math.floor(Math.random() * anims.length)];
        anims.forEach(function (cls) { ghost.classList.remove(cls); });
        void ghost.offsetWidth;
        ghost.classList.add(a);
        setTimeout(function () { ghost.classList.remove(a); }, 1050);

        if (clickCount >= 5) {
          clickCount = 0;
          if (typeof openArchiveUnlocked === 'function') openArchiveUnlocked();
        }
        clearTimeout(clickTimer);
        clickTimer = setTimeout(function () { clickCount = 0; }, 3000);
      });

      if (!isTouch && !reducedMotion) {
        var targetX = 0, targetY = 0;
        var curX = 0, curY = 0;
        var raf = null;
        var MAX_SHIFT = 8;

        document.addEventListener('mousemove', function (e) {
          var rect = ghost.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = e.clientX - cx;
          var dy = e.clientY - cy;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          var k = Math.min(dist / 400, 1);
          targetX = (dx / dist) * MAX_SHIFT * k;
          targetY = (dy / dist) * MAX_SHIFT * k * 0.6;
          if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });

        function loop() {
          curX += (targetX - curX) * 0.14;
          curY += (targetY - curY) * 0.14;
          ghost.style.transform =
            'translate(' + curX.toFixed(1) + 'px, ' + curY.toFixed(1) + 'px)';
          if (Math.abs(targetX - curX) > 0.2 || Math.abs(targetY - curY) > 0.2) {
            raf = requestAnimationFrame(loop);
          } else {
            raf = null;
          }
        }
      }
    } catch (e) { console.warn('ghost:', e); }
  }

  /* ------------------------------------------------------------
     ПАСХАЛКА ARCHIVE UNLOCKED (внутренняя, отдельная от corrupted.js)
     ------------------------------------------------------------ */
  function openArchiveUnlocked() {
    try {
      var modal = document.querySelector('.archive-unlocked');
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'archive-unlocked';
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML =
          '<div class="archive-unlocked__inner">' +
            '<button class="archive-unlocked__close" aria-label="Закрыть">✕</button>' +
            '<img class="archive-unlocked__ghost" src="https://i.ibb.co/G46gG6hM/SPODZHLOGO.png" alt="" style="max-width:88px;" />' +
            '<span class="archive-unlocked__tag">[ ACCESS GRANTED ]</span>' +
            '<h3 class="archive-unlocked__title">ARCHIVE UNLOCKED</h3>' +
            '<p class="archive-unlocked__text">ты нашёл секретный файл 👻</p>' +
            '<span class="archive-unlocked__hint">нажми ESC или ✕</span>' +
          '</div>';
        document.body.appendChild(modal);
        modal.querySelector('.archive-unlocked__close').addEventListener('click', closeArchiveUnlocked);
        modal.addEventListener('click', function (e) {
          if (e.target === modal) closeArchiveUnlocked();
        });
      }
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } catch (e) {}
  }

  function closeArchiveUnlocked() {
    var modal = document.querySelector('.archive-unlocked');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeArchiveUnlocked();
  });

  /* ------------------------------------------------------------
     ПИКСЕЛЬ-ЦЕНЗУРА
     ------------------------------------------------------------ */
  function initPixelCensor() {
    if (isTouch || reducedMotion) return;
    try {
      var thumbs = document.querySelectorAll('.tile__thumb, .featured__media');
      if (!thumbs.length) return;
      thumbs.forEach(function (th) {
        if (th.querySelector('.pixel-censor')) return;
        var censor = document.createElement('div');
        censor.className = 'pixel-censor';
        censor.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < 80; i++) censor.appendChild(document.createElement('i'));
        th.appendChild(censor);
      });
    } catch (e) {}
  }

  /* ------------------------------------------------------------
     ГЛИТЧ-ФЛЕШ
     ------------------------------------------------------------ */
  function initGlitchFlash() {
    if (reducedMotion) return;
    try {
      var flash = document.createElement('div');
      flash.className = 'glitch-flash';
      flash.setAttribute('aria-hidden', 'true');
      document.body.appendChild(flash);

      function runFlash() {
        flash.classList.remove('run');
        void flash.offsetWidth;
        flash.classList.add('run');
        setTimeout(function () { flash.classList.remove('run'); }, 420);
      }

      document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', runFlash);
      });

      var fc = document.getElementById('featuredCard');
      if (fc) {
        var media = fc.querySelector('.featured__media');
        if (media) media.addEventListener('click', runFlash);
      }

      document.querySelectorAll('.tile').forEach(function (t) {
        t.addEventListener('click', runFlash);
      });
    } catch (e) {}
  }

  /* ------------------------------------------------------------
     HERO-ПРИЗРАК — реакция на hover и клик
     ------------------------------------------------------------ */
  function initHeroGhost() {
    if (isTouch || reducedMotion) return;
    try {
      var heroGhost = document.querySelector('.hero-ghost');
      if (!heroGhost) return;

      // Страховка размеров
      var hImg = heroGhost.querySelector('img');
      if (hImg) {
        hImg.style.maxWidth = '72px';
        hImg.style.maxHeight = '72px';
        hImg.style.objectFit = 'contain';
      }

      heroGhost.addEventListener('mouseenter', function () {
        heroGhost.classList.remove('is-wiggling');
        void heroGhost.offsetWidth;
        heroGhost.classList.add('is-wiggling');
        setTimeout(function () { heroGhost.classList.remove('is-wiggling'); }, 950);
      });

      var count = 0, timer = null;
      heroGhost.style.cursor = 'pointer';
      heroGhost.addEventListener('click', function () {
        count++;
        heroGhost.classList.remove('is-wiggling');
        void heroGhost.offsetWidth;
        heroGhost.classList.add('is-wiggling');
        setTimeout(function () { heroGhost.classList.remove('is-wiggling'); }, 950);

        if (count >= 5) {
          count = 0;
          openArchiveUnlocked();
        }
        clearTimeout(timer);
        timer = setTimeout(function () { count = 0; }, 3000);
      });
    } catch (e) {}
  }

  /* ------------------------------------------------------------
     ЗАПУСК
     ------------------------------------------------------------ */
  function init() {
    initDoodles();
    initGhost();
    initPixelCensor();
    initGlitchFlash();
    initHeroGhost();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();