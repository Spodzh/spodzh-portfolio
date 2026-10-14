/* ============================================================
   REVIEWS.JS — FEEDBACK ARCHIVE (Cloudflare Worker + D1)
   С автовысотой textarea и улучшенной валидацией
   ============================================================ */
(function () {
  'use strict';

  /* ---------- URL ТВОЕГО WORKER'А ---------- */
  var API_BASE = 'https://spodzh-reviews-api.ernest-chanel.workers.dev';

  /* ---------- НАСТРОЙКИ ---------- */
  var MIN_TEXT = 20;
  var MAX_TEXT = 1000;
  var RATE_LIMIT_SECONDS = 60;

  /* ---------- ЭЛЕМЕНТЫ ---------- */
  var grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  /* ---------- УТИЛИТЫ ---------- */
  function pad(n) { return String(n).padStart(3, '0'); }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function canSubmit() {
    try {
      var last = parseInt(localStorage.getItem('spodzh_last_review') || '0', 10);
      return (Date.now() - last) / 1000 > RATE_LIMIT_SECONDS;
    } catch (e) { return true; }
  }

  function markSubmitted() {
    try { localStorage.setItem('spodzh_last_review', String(Date.now())); } catch (e) {}
  }

  function showNotice(type, message) {
    var prev = document.querySelector('.reviews-notice');
    if (prev) prev.remove();

    var el = document.createElement('div');
    el.className = 'reviews-notice reviews-notice--' + type;
    el.textContent = message;
    document.body.appendChild(el);

    requestAnimationFrame(function () { el.classList.add('reviews-notice--visible'); });
    setTimeout(function () {
      el.classList.remove('reviews-notice--visible');
      setTimeout(function () { el.remove(); }, 400);
    }, 4200);
  }

  /* ---------- КАРТОЧКА ОТЗЫВА ---------- */
  function renderCard(r, index) {
    var card = document.createElement('article');
    card.className = 'review-card reveal';

    var letter = (r.author || '?').trim().charAt(0).toUpperCase();

    var linkHTML = '';
    if (r.link) {
      linkHTML =
        '<a class="review-card__link" href="' + escapeHTML(r.link) + '" target="_blank" rel="noopener">' +
          '<span>VIEW ORIGINAL</span>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">' +
            '<path d="M7 17L17 7M7 7h10v10" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
        '</a>';
    } else {
      linkHTML = '<span class="review-card__source">verified</span>';
    }

    var readMoreHTML = '';
    if (r.text && r.text.length > 180) {
      readMoreHTML =
        '<button class="review-card__read-more" type="button" data-action="read-more">' +
          '<span>Читать полностью</span>' +
        '</button>';
    }

    var num = 'REVIEW_' + pad(index + 1);
    var date = formatDate(r.created_at);

    card.innerHTML =
      '<div class="review-card__head">' +
        '<span class="review-card__num">' + num + '</span>' +
        '<span class="review-card__date">' + date + '</span>' +
      '</div>' +
      '<div class="review-card__author">' +
        '<div class="review-card__avatar review-card__avatar--letter">' + letter + '</div>' +
        '<div class="review-card__info">' +
          '<span class="review-card__name">' + escapeHTML(r.author) + '</span>' +
          '<span class="review-card__role">' + escapeHTML(r.role || '') + '</span>' +
        '</div>' +
      '</div>' +
      '<p class="review-card__text">' + escapeHTML(r.text) + '</p>' +
      readMoreHTML +
      '<div class="review-card__footer">' + linkHTML + '</div>' +
      '<svg class="review-card__doodle" viewBox="0 0 40 40" aria-hidden="true">' +
        '<path d="M6 6 L34 34 M34 6 L6 34" stroke="#ffd93d" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      '</svg>';

    return card;
  }

  /* ---------- ФОРМА ---------- */
  function renderForm() {
    var form = document.createElement('form');
    form.className = 'review-form';
    form.setAttribute('novalidate', 'novalidate');
    form.innerHTML =
      '<div class="review-form__head">' +
        '<span class="review-form__num">[ SUBMIT_REVIEW.exe ]</span>' +
        '<h3 class="review-form__title">ОСТАВИТЬ ОТЗЫВ</h3>' +
        '<p class="review-form__sub">Если мы работали вместе — напиши пару слов. Отзыв появится после проверки.</p>' +
      '</div>' +

      '<div class="review-form__row">' +
        '<label class="review-form__field">' +
          '<span class="review-form__label">Имя *</span>' +
          '<input type="text" name="author" required minlength="2" maxlength="60" ' +
                 'placeholder="Как тебя зовут?" autocomplete="name" />' +
        '</label>' +
        '<label class="review-form__field">' +
          '<span class="review-form__label">Роль / проект</span>' +
          '<input type="text" name="role" maxlength="80" ' +
                 'placeholder="блогер, бренд, коллаб..." />' +
        '</label>' +
      '</div>' +

      '<label class="review-form__field">' +
        '<span class="review-form__label">Отзыв * <small>(' + MIN_TEXT + '–' + MAX_TEXT + ' символов)</small></span>' +
        '<textarea name="text" required minlength="' + MIN_TEXT + '" maxlength="' + MAX_TEXT + '" ' +
                  'rows="5" placeholder="Что тебе понравилось? Как прошла работа?"></textarea>' +
        '<span class="review-form__counter" data-counter>0 / ' + MAX_TEXT + '</span>' +
      '</label>' +

      '<label class="review-form__field">' +
        '<span class="review-form__label">Ссылка на исходное сообщение (если есть)</span>' +
        '<input type="url" name="link" maxlength="300" ' +
               'placeholder="https://t.me/... или ссылка на пост" />' +
      '</label>' +

      '<label class="review-form__honeypot" aria-hidden="true">' +
        '<input type="text" name="website" tabindex="-1" autocomplete="off" />' +
      '</label>' +

      '<label class="review-form__check">' +
        '<input type="checkbox" name="agree" required />' +
        '<span>Я согласен с тем, что отзыв будет виден всем посетителям сайта</span>' +
      '</label>' +

      '<div class="review-form__actions">' +
        '<button type="submit" class="btn btn--primary review-form__submit">' +
          '<span>ОТПРАВИТЬ</span>' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4">' +
            '<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
        '</button>' +
        '<span class="review-form__status" data-status></span>' +
      '</div>';

    return form;
  }

  /* ---------- ЗАГРУЗКА ---------- */
  function loadReviews() {
    fetch(API_BASE + '/reviews', { method: 'GET' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        renderAll(Array.isArray(data) ? data : []);
      })
      .catch(function (err) {
        console.warn('[reviews] load error:', err);
        renderAll([]);
      });
  }

  /* ---------- РЕНДЕР ВСЕХ ---------- */
  function renderAll(reviews) {
    grid.innerHTML = '';

    if (!reviews || !reviews.length) {
      var empty = document.createElement('div');
      empty.className = 'reviews__empty';
      empty.innerHTML = 'Пока отзывов нет. <b>Будь первым</b> — заполни форму ниже.';
      grid.appendChild(empty);
      return;
    }

    reviews.forEach(function (r, i) {
      var card = renderCard(r, i);
      card.style.transitionDelay = (i * 70) + 'ms';
      grid.appendChild(card);
    });

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      grid.querySelectorAll('.review-card.reveal').forEach(function (c) { obs.observe(c); });
    } else {
      grid.querySelectorAll('.review-card.reveal').forEach(function (c) { c.classList.add('visible'); });
    }
  }

  /* ---------- ОБРАБОТКА ФОРМЫ ---------- */
  function bindForm(form) {
    var textarea = form.querySelector('[name="text"]');
    var counter = form.querySelector('[data-counter]');

    if (textarea && counter) {
      /* Автовысота: textarea растёт при вводе длинного текста */
      var autoGrow = function () {
        textarea.style.height = 'auto';
        var newHeight = Math.max(140, textarea.scrollHeight);
        textarea.style.height = newHeight + 'px';
      };

      textarea.addEventListener('input', function () {
        counter.textContent = textarea.value.length + ' / ' + MAX_TEXT;
        counter.classList.toggle('review-form__counter--warn',
          textarea.value.length > MAX_TEXT * 0.9);
        autoGrow();
      });

      /* Стартовая высота */
      autoGrow();

      /* На случай сброса формы — возвращаем высоту к старту */
      form.addEventListener('reset', function () {
        setTimeout(autoGrow, 0);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var status = form.querySelector('[data-status]');
      var submit = form.querySelector('.review-form__submit');
      var author = (form.author.value || '').trim();
      var role = (form.role.value || '').trim();
      var text = (form.text.value || '').trim();
      var link = (form.link.value || '').trim();
      var honeypot = (form.website.value || '').trim();
      var agree = form.agree.checked;

      if (honeypot) {
        showNotice('success', 'Спасибо! Отзыв получен.');
        form.reset();
        return;
      }

      if (author.length < 2) return showNotice('error', 'Имя слишком короткое');
      if (text.length < MIN_TEXT) return showNotice('error', 'Отзыв должен быть минимум ' + MIN_TEXT + ' символов');
      if (text.length > MAX_TEXT) return showNotice('error', 'Отзыв слишком длинный');
      if (!agree) return showNotice('error', 'Нужно согласие');
      if (link && !/^https?:\/\//i.test(link)) return showNotice('error', 'Ссылка должна начинаться с http:// или https://');
      if (!canSubmit()) return showNotice('error', 'Слишком часто. Подожди минуту.');

      submit.disabled = true;
      submit.style.opacity = '.5';
      if (status) status.textContent = 'Отправка...';

      fetch(API_BASE + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author,
          role: role || null,
          text: text,
          link: link || null
        })
      })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        submit.disabled = false;
        submit.style.opacity = '';
        if (status) status.textContent = '';

        if (!result.ok) {
          console.warn('[reviews] submit error:', result.data);
          showNotice('error', 'Не получилось отправить. Попробуй ещё раз.');
          return;
        }

        markSubmitted();
        form.reset();
        if (counter) counter.textContent = '0 / ' + MAX_TEXT;
        showNotice('success', 'Отзыв отправлен! Появится после проверки.');
      })
      .catch(function (err) {
        console.warn('[reviews] network error:', err);
        submit.disabled = false;
        submit.style.opacity = '';
        if (status) status.textContent = '';
        showNotice('error', 'Ошибка сети. Попробуй позже.');
      });
    });

    /* Read more в карточках (клики) */
    form.parentNode.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="read-more"]');
      if (!btn) return;
      var card = btn.closest('.review-card');
      if (!card) return;
      var textEl = card.querySelector('.review-card__text');
      if (!textEl) return;
      var expanded = textEl.classList.toggle('expanded');
      btn.classList.toggle('expanded', expanded);
      var label = btn.querySelector('span');
      if (label) label.textContent = expanded ? 'Свернуть' : 'Читать полностью';
    });
  }

  /* ---------- ИНИЦИАЛИЗАЦИЯ ---------- */
  function init() {
    loadReviews();

    var form = renderForm();
    grid.parentNode.appendChild(form);
    bindForm(form);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
