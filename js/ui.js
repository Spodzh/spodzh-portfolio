/* ============================================================
   UI.JS — прелоадер, курсор, меню, скролл
   Всё, что связано с интерфейсом и навигацией.
   ============================================================ */

/* ---------- 1. ПРЕЛОАДЕР ---------- */
// Самое простое: как только DOM готов — прячем лоадер
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 800);
  }
});

// Дублирующий триггер на всякий случай
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
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

   
   /* ---------- 6. КОПИРОВАНИЕ КОНТАКТА ---------- */
/* Кнопка «Скопировать @spodzh» в финальном CTA */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    const label = btn.querySelector('.copy-label');
    const original = label.textContent;

    try {
      await navigator.clipboard.writeText(text);
      label.textContent = 'Скопировано ✓';
      btn.classList.add('is-copied');

      setTimeout(() => {
        label.textContent = original;
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

      label.textContent = 'Скопировано ✓';
      setTimeout(() => label.textContent = original, 1800);
    }
  });
});
