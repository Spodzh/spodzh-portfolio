/* ============================================================
   ANIMATIONS.JS — все анимации сайта
   Появление блоков, счётчики, магнитные кнопки
   ============================================================ */

/* ---------- 1. REVEAL — плавное появление блоков при скролле ---------- */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Каскадная задержка — элементы появляются по очереди
      const delay = Math.min(i * 80, 400);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealElements.forEach(el => revealObserver.observe(el));


/* ---------- 2. СЧЁТЧИКИ (45 000+, 3 года, 22) ---------- */
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
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value = Math.floor(target * eased);

    el.textContent = value.toLocaleString('ru-RU') + suffix;

    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('ru-RU') + suffix;
  }
  requestAnimationFrame(tick);
}


/* ---------- 3. МАГНИТНЫЕ КНОПКИ ---------- */
/* Кнопки с классом .magnetic слегка «притягиваются» к курсору */
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