/* ============================================================
   MAIN.JS — вся логика сайта в одном файле
   Разбит на блоки, каждый в try/catch, чтобы один не ломал всё.
   ============================================================ */

/* ---------- 1. ГОД В ФУТЕРЕ ---------- */
try {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
} catch (e) { console.warn('year:', e); }


/* ---------- 2. ПРЕЛОАДЕР (надёжное скрытие) ---------- */
(function () {
  const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (!loader || loader.classList.contains('hidden')) return;
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 700);
  };

  // Скрываем, когда DOM готов (не ждём все картинки)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(hideLoader, 1500));
  } else {
    setTimeout(hideLoader, 1500);
  }

  // Страховка: если картинки зависли — прячем через 4 секунды в любом случае
  setTimeout(hideLoader, 4000);
})();


/* ---------- 3. БУРГЕР-МЕНЮ ---------- */
try {
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
} catch (e) { console.warn('burger:', e); }


/* ---------- 4. НАВБАР + СКРОЛЛ-ПРОГРЕСС ---------- */
try {
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);

    if (scrollProgress) {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';
    }
  });
} catch (e) { console.warn('scroll:', e); }


/* ---------- 5. REVEAL — появление блоков ---------- */
try {
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));
} catch (e) { console.warn('reveal:', e); }


/* ---------- 6. СЧЁТЧИКИ ---------- */
try {
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);
      el.textContent = value.toLocaleString('ru-RU') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('ru-RU') + suffix;
    }
    requestAnimationFrame(tick);
  }
} catch (e) { console.warn('counters:', e); }


/* ---------- 7. МАГНИТНЫЕ КНОПКИ ---------- */
try {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
} catch (e) { console.warn('magnetic:', e); }


/* ---------- 8. КОПИРОВАНИЕ КОНТАКТА ---------- */
try {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      const label = btn.querySelector('.copy-label');
      const original = label ? label.textContent : '';

      try {
        await navigator.clipboard.writeText(text);
        if (label) label.textContent = 'Скопировано ✓';
        btn.classList.add('is-copied');
        setTimeout(() => {
          if (label) label.textContent = original;
          btn.classList.remove('is-copied');
        }, 1800);
      } catch (err) {
        // Fallback для старых браузеров
        const tmp = document.createElement('textarea');
        tmp.value = text;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        if (label) label.textContent = 'Скопировано ✓';
        setTimeout(() => { if (label) label.textContent = original; }, 1800);
      }
    });
  });
} catch (e) { console.warn('copy:', e); }


/* ---------- 9. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ---------- */
try {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
} catch (e) { console.warn('smooth:', e); }


/* ---------- 10. ЛОГ В КОНСОЛЬ ---------- */
console.log('%cSPODZH 👻', 'color:#00e5ff; font-size:24px; font-weight:bold;');
console.log('%cСайт загружен. Привет, Влад!', 'color:#ff2d75; font-size:14px;');
