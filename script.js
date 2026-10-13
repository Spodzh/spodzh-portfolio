/* =========================================================
   SPODZH PORTFOLIO — Premium Edition 2026
   ========================================================= */

/* ========== 1. ГОД В ФУТЕРЕ ========== */
document.getElementById('year').textContent = new Date().getFullYear();


/* ========== 2. ПРЕЛОАДЕР ========== */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 1500);
});


/* ========== 3. КАСТОМНЫЙ КУРСОР (только точка) ========== */
const cursorDot = document.getElementById('cursorDot');

window.addEventListener('mousemove', (e) => {
  cursorDot.style.transform =
    `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});


/* ========== 4. БУРГЕР-МЕНЮ ========== */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

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


/* ========== 5. НАВБАР ПРИ СКРОЛЛЕ + ПРОГРЕСС ========== */
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = progress + '%';
});


/* ========== 6. REVEAL-АНИМАЦИИ (stagger) ========== */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = Math.min(i * 80, 400);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealElements.forEach(el => revealObserver.observe(el));


/* ========== 7. АНИМИРОВАННЫЕ СЧЁТЧИКИ ========== */
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


/* ========== 8. МАГНИТНЫЕ КНОПКИ ========== */
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


/* ========== 9. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ========== */
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
