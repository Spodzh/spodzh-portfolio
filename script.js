/* =========================================================
   SPODZH PORTFOLIO — логика сайта
   ========================================================= */

// 1. Год в футере (обновляется сам)
document.getElementById('year').textContent = new Date().getFullYear();

// 2. Меню-бургер на телефоне
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Закрываем меню при клике на ссылку
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// 3. Изменение навбара при скролле
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// 4. Плавное появление блоков при скролле (IntersectionObserver)
const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // небольшая задержка для «каскадного» появления
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => observer.observe(el));
