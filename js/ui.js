/* ============================================================
   UI.JS — прелоадер, курсор, меню, скролл
   Всё, что связано с интерфейсом и навигацией.
   ============================================================ */

/* ---------- 1. ПРЕЛОАДЕР ---------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 1500);
});


/* ---------- 2. КАСТОМНЫЙ КУРСОР (точка) ---------- */
const cursorDot = document.getElementById('cursorDot');

window.addEventListener('mousemove', (e) => {
  cursorDot.style.transform =
    `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});


/* ---------- 3. БУРГЕР-МЕНЮ ---------- */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  navLinks.classList.toggle('open');
  // Блокируем скролл, пока меню открыто
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Закрываем меню при клике на любую ссылку внутри
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});


/* ---------- 4. НАВБАР + СКРОЛЛ-ПРОГРЕСС ---------- */
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
  // Меняем вид шапки после 30px скролла
  navbar.classList.toggle('scrolled', window.scrollY > 30);

  // Обновляем полоску прогресса сверху
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = progress + '%';
});


/* ---------- 5. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ---------- */
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