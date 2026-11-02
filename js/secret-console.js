/* ============================================================
   SECRET-CONSOLE.JS — секретная консоль + система прогресса
   Версия: 1.0
   Никаких сетевых запросов. Всё локально в localStorage.
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     СИСТЕМА ПРОГРЕССА
     ============================================================ */
  var PROGRESS_KEY = 'spodzh_secrets_v1';
  var CURRENT_VERSION = 1;

  function defaultProgress() {
    return {
      version: CURRENT_VERSION,
      found: [],
      events: [],
      hints_seen: [],
      ghost_interactions: 0,
      visits: 0,
      first_visit: new Date().toISOString(),
      last_visit: new Date().toISOString(),
      console_commands: 0,
      finale_unlocked: false,
      finale_seen: false
    };
  }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return defaultProgress();
      var data = JSON.parse(raw);
      if (!data || data.version !== CURRENT_VERSION) {
        return defaultProgress();
      }
      // Дочищаем дефолтные поля, если их нет
      var base = defaultProgress();
      Object.keys(base).forEach(function (k) {
        if (!(k in data)) data[k] = base[k];
      });
      return data;
    } catch (e) {
      return defaultProgress();
    }
  }

  function saveProgress(data) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function resetProgress() {
    try {
      localStorage.removeItem(PROGRESS_KEY);
    } catch (e) {}
    progress = defaultProgress();
    saveProgress(progress);
  }

  var progress = loadProgress();

  function markEvent(name) {
    if (progress.events.indexOf(name) === -1) {
      progress.events.push(name);
      saveProgress(progress);
    }
  }

  function markFound(id) {
    if (progress.found.indexOf(id) === -1) {
      progress.found.push(id);
      saveProgress(progress);
      return true;
    }
    return false;
  }

  function bumpVisits() {
    var today = new Date().toISOString().slice(0, 10);
    var lastDay = progress.last_visit ? progress.last_visit.slice(0, 10) : '';
    if (today !== lastDay) {
      progress.visits++;
    }
    progress.last_visit = new Date().toISOString();
    saveProgress(progress);
  }

  bumpVisits();

  /* ============================================================
     СЕКРЕТНЫЕ ФАЙЛЫ
     ============================================================ */
  var SECRET_FILES = [
    {
      id: 'NULL_POINTER',
      file: 'FILE_007',
      title: 'NULL_POINTER',
      status: 'CORRUPTED',
      hint: 'Первый файл архива всегда доступен. Попробуй команду secrets.',
      check: function () { return true; },
      text: 'Первый файл архива повреждён. Он ни о чём. Но с него всё началось. Кто-то нажал Enter — и потерял контроль.'
    },
    {
      id: 'GHOST_PROTOCOL',
      file: 'FILE_013',
      title: 'GHOST_PROTOCOL',
      status: 'RESTRICTED',
      hint: 'Призрак не любит равнодушных. Коснись его — пять раз подряд, но в течение минуты.',
      check: function () { return progress.ghost_interactions >= 5; },
      text: 'Протокол связи с призраком активирован. Он не всегда рядом, но он всегда помнит. Команда ghost теперь доступна.'
    },
    {
      id: 'BROKEN_TIMELINE',
      file: 'FILE_021',
      title: 'BROKEN_TIMELINE',
      status: 'MISSING',
      hint: 'Фрагменты истории не сходятся. Один кадр пропущен. Возможно, в моей истории.',
      check: function () { return progress.events.indexOf('visited_story') !== -1; },
      text: 'Хронология разорвана. Некоторые даты повторяются. Некоторые исчезают. Я не помню 2013-й.'
    },
    {
      id: 'SILENT_SIGNAL',
      file: 'FILE_034',
      title: 'SILENT_SIGNAL',
      status: 'ENCRYPTED',
      hint: 'Сигнал повторяется раз в день. Если ты вернёшься — услышишь.',
      check: function () { return progress.visits >= 3; },
      text: 'Сигнал принят. Источник неизвестен. Передача идёт на частоте 013.7. Запись шума сохранена.'
    },
    {
      id: 'ARCHIVIST',
      file: 'FILE_055',
      title: 'ARCHIVIST',
      status: 'HIDDEN',
      hint: 'Ты ещё не начал разговаривать с консолью. Пять команд — и она откроется.',
      check: function () { return progress.console_commands >= 5; },
      text: 'Ты стал архивариусом. У тебя есть права на чтение, но не на изменение. Команда finale теперь доступна.'
    },
    {
      id: 'END_OF_FILE',
      file: 'FILE_089',
      title: 'END_OF_FILE',
      status: 'CLASSIFIED',
      hint: 'Всё ещё не конец. Собери остальные фрагменты и набери finale.',
      check: function () {
        return progress.found.length >= 5;
      },
      text: 'Ты нашёл конец файла. Но это не конец истории. Призрак всё ещё здесь. Набери finale, чтобы увидеть.'
    }
  ];

  function findSecret(id) {
    for (var i = 0; i < SECRET_FILES.length; i++) {
      if (SECRET_FILES[i].id === id) return SECRET_FILES[i];
    }
    return null;
  }

  /* ============================================================
     УТИЛИТЫ
     ============================================================ */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
     КОНСОЛЬ
     ============================================================ */
  var UI = null;
  var history = [];
  var historyIndex = -1;

  function buildUI() {
    var root = document.getElementById('secretConsole');
    if (!root) return null;

    return {
      root: root,
      output: root.querySelector('#scOutput'),
      input: root.querySelector('#scInput'),
      form: root.querySelector('#scForm'),
      close: root.querySelector('[data-sc-close]')
    };
  }

  function print(html, cls) {
    if (!UI || !UI.output) return;
    var line = el('div', 'sc-line' + (cls ? ' sc-line--' + cls : ''));
    line.innerHTML = html;
    UI.output.appendChild(line);
    UI.output.scrollTop = UI.output.scrollHeight;
  }

  function printText(text, cls) {
    print(esc(text), cls);
  }

  function openConsole() {
    if (!UI) UI = buildUI();
    if (!UI) return;
    if (UI.root.classList.contains('open')) {
      UI.input.focus();
      return;
    }
    UI.root.classList.add('open');
    UI.root.setAttribute('aria-hidden', 'false');
    setTimeout(function () { UI.input.focus(); }, 100);

    if (!UI.root.dataset.booted) {
      UI.root.dataset.booted = '1';
      printWelcome();
    }
  }

  function closeConsole() {
    if (!UI) return;
    UI.root.classList.remove('open');
    UI.root.setAttribute('aria-hidden', 'true');
  }

  function printWelcome() {
    printText('SPODZH // ARCHIVE_TERMINAL', 'head');
    printText('v1.0 · ' + new Date().toISOString().slice(0, 10), 'dim');
    printText('');
    printText('введи help для списка команд', 'dim');
    printText('');
  }

  /* ============================================================
     КОМАНДЫ
     ============================================================ */
  var COMMANDS = {

    help: function () {
      printText('ДОСТУПНЫЕ КОМАНДЫ:', 'head');
      printText('  help             — этот список');
      printText('  status           — состояние архива');
      printText('  secrets          — список файлов (найденные / скрытые)');
      printText('  hint [id]        — подсказка по файлу');
      printText('  open [id]        — открыть файл, если условие выполнено');
      printText('  ghost            — взаимодействие с призраком');
      printText('  history          — история событий');
      printText('  time             — метка времени');
      printText('  clear            — очистить экран');
      printText('  reset            — сбросить весь прогресс (с подтверждением)');
      printText('  finale           — попытка открыть финал');
      printText('');
      printText('ID файлов можно посмотреть командой secrets.', 'dim');
    },

    status: function () {
      printText('СОСТОЯНИЕ АРХИВА:', 'head');
      printText('  визитов (дней):     ' + progress.visits);
      printText('  найдено файлов:     ' + progress.found.length + ' / ' + SECRET_FILES.length);
      printText('  событий:            ' + progress.events.length);
      printText('  взаимодействий с призраком: ' + progress.ghost_interactions);
      printText('  команд в консоли:   ' + progress.console_commands);
      printText('  финал открыт:       ' + (progress.finale_unlocked ? 'да' : 'нет'));
      printText('');
    },

    secrets: function () {
      printText('АРХИВНЫЕ ФАЙЛЫ:', 'head');
      printText('');
      SECRET_FILES.forEach(function (f) {
        var found = progress.found.indexOf(f.id) !== -1;
        var status = found ? 'НАЙДЕН' : 'СКРЫТ';
        var cls = found ? 'found' : 'locked';
        printText('  [' + f.file + ']  ' + f.id + '  ·  ' + status, cls);
      });
      printText('');
      printText('используй hint [id] для подсказки', 'dim');
      printText('');
    },

    hint: function (args) {
      if (!args.length) {
        printText('использование: hint [id]', 'err');
        printText('например: hint NULL_POINTER', 'dim');
        return;
      }
      var id = args[0].toUpperCase();
      var f = findSecret(id);
      if (!f) {
        printText('файл не найден: ' + id, 'err');
        return;
      }
      if (progress.found.indexOf(f.id) !== -1) {
        printText('файл уже открыт.', 'warn');
        printText('текст файла:', 'dim');
        printText(f.text);
        return;
      }
      if (progress.hints_seen.indexOf(f.id) === -1) {
        progress.hints_seen.push(f.id);
        saveProgress(progress);
      }
      printText('[' + f.file + '] ' + f.title, 'head');
      printText('статус: ' + f.status, 'dim');
      printText('');
      printText('подсказка:');
      printText(f.hint, 'hint');
      printText('');
    },

    open: function (args) {
      if (!args.length) {
        printText('использование: open [id]', 'err');
        return;
      }
      var id = args[0].toUpperCase();
      var f = findSecret(id);
      if (!f) {
        printText('файл не найден: ' + id, 'err');
        return;
      }
      if (progress.found.indexOf(f.id) !== -1) {
        printText('файл уже открыт. содержание:', 'warn');
        printText(f.text);
        return;
      }
      var ok = false;
      try { ok = f.check(); } catch (e) { ok = false; }
      if (!ok) {
        printText('доступ запрещён.', 'err');
        printText('условие не выполнено. попробуй hint ' + f.id, 'dim');
        return;
      }
      markFound(f.id);
      printText('✓ ' + f.file + ' ОТКРЫТ', 'found');
      printText('');
      printText(f.text);
      printText('');
      if (f.id === 'END_OF_FILE') {
        printText('финал доступен. набери finale.', 'hint');
      }
    },

    ghost: function () {
      if (progress.found.indexOf('GHOST_PROTOCOL') === -1) {
        printText('призрак не отвечает.', 'err');
        printText('сначала найди и открой GHOST_PROTOCOL', 'dim');
        return;
      }
      var replies = [
        'призрак: ты звал?',
        'призрак: я помню тебя. ты был здесь раньше.',
        'призрак: архив не для всех. ты прошёл.',
        'призрак: я застрял между FILE_007 и FILE_089. ищу выход.',
        'призрак: осторожнее. некоторые файлы не хотят, чтобы их нашли.',
        'призрак: ...'
      ];
      var idx = progress.ghost_interactions % replies.length;
      printText(replies[idx], 'ghost');
      progress.ghost_interactions++;
      saveProgress(progress);
    },

    history: function () {
      if (!progress.events.length) {
        printText('событий пока не было.', 'dim');
        return;
      }
      printText('ИСТОРИЯ СОБЫТИЙ:', 'head');
      printText('');
      progress.events.forEach(function (e, i) {
        printText('  ' + String(i + 1).padStart(2, '0') + '. ' + e);
      });
      printText('');
    },

    time: function () {
      var now = new Date();
      printText('СИСТЕМНОЕ ВРЕМЯ:');
      printText('  ' + now.toISOString());
      printText('');
      printText('метка архива: FILE_' + String(
        (now.getTime() % 900) + 100
      ));
      printText('');
    },

    clear: function () {
      if (UI && UI.output) UI.output.innerHTML = '';
      printText('экран очищен.', 'dim');
    },

    reset: function (args) {
      if (args.length < 1 || args[0].toLowerCase() !== 'confirm') {
        printText('⚠️  ВНИМАНИЕ', 'err');
        printText('эта команда удалит ВЕСЬ прогресс по секретам:');
        printText('  · найденные файлы');
        printText('  · историю событий');
        printText('  · счётчик взаимодействий');
        printText('  · открытый финал');
        printText('');
        printText('если уверен — введи: reset confirm', 'warn');
        return;
      }
      resetProgress();
      printText('прогресс сброшен.', 'warn');
      printText('начни с команды secrets.', 'dim');
    },

    finale: function () {
      var allFound = SECRET_FILES.slice(0, 5).every(function (f) {
        return progress.found.indexOf(f.id) !== -1;
      });
      if (!allFound) {
        printText('финал ещё не открыт.', 'err');
        var remaining = 5 - SECRET_FILES.slice(0, 5).filter(function (f) {
          return progress.found.indexOf(f.id) !== -1;
        }).length;
        printText('осталось файлов: ' + remaining, 'dim');
        return;
      }
      if (progress.found.indexOf('END_OF_FILE') === -1) {
        printText('конец файла не найден. открой END_OF_FILE.', 'err');
        return;
      }
      progress.finale_unlocked = true;
      saveProgress(progress);
      printText('✓ ФИНАЛ ДОСТУПЕН', 'found');
      printText('');
      printText('закрываю консоль...', 'dim');
      markEvent('finale_unlocked');

      setTimeout(function () {
        closeConsole();
        document.dispatchEvent(new CustomEvent('spodzh:finale-unlocked'));
      }, 1200);
    }
  };

  /* ============================================================
     ОБРАБОТКА ВВОДА
     ============================================================ */
  function runCommand(raw) {
    var line = String(raw || '').trim();
    if (!line) return;

    print('> ' + esc(line), 'input');

    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var args = parts.slice(1);

    var fn = COMMANDS[cmd];
    if (typeof fn === 'function') {
      progress.console_commands++;
      saveProgress(progress);
      try { fn(args); } catch (e) {
        printText('ошибка команды: ' + e.message, 'err');
      }
    } else {
      printText('неизвестная команда: ' + cmd, 'err');
      printText('введи help для списка', 'dim');
    }
    printText('');
  }

  /* ============================================================
     ИНИЦИАЛИЗАЦИЯ UI
     ============================================================ */
  function init() {
    UI = buildUI();
    if (!UI) return;

    // Отправка формы
    UI.form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = UI.input.value;
      if (!val.trim()) return;
      history.push(val);
      historyIndex = history.length;
      runCommand(val);
      UI.input.value = '';
    });

    // История команд стрелками
    UI.input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') {
        if (historyIndex > 0) {
          historyIndex--;
          UI.input.value = history[historyIndex] || '';
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          UI.input.value = history[historyIndex] || '';
        } else {
          historyIndex = history.length;
          UI.input.value = '';
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        closeConsole();
      }
    });

    // Клик по фону — закрыть
    UI.root.addEventListener('click', function (e) {
      if (e.target === UI.root) closeConsole();
    });

    // Кнопка закрытия
    if (UI.close) UI.close.addEventListener('click', closeConsole);

    // Глобальные клавиши
    document.addEventListener('keydown', function (e) {
      // Не мешаем вводу в полях
      var tag = (e.target && e.target.tagName) || '';
      var inField = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable);

      // Ctrl+Shift+~ — всегда
      if (e.ctrlKey && e.shiftKey && (e.key === '~' || e.key === '`' || e.code === 'Backquote')) {
        e.preventDefault();
        if (UI.root.classList.contains('open')) closeConsole();
        else openConsole();
        return;
      }

      // ~ без модификаторов — только если не в поле
      if (!inField && !e.ctrlKey && !e.altKey && !e.metaKey && (e.key === '~' || e.key === '`' || e.code === 'Backquote')) {
        e.preventDefault();
        if (UI.root.classList.contains('open')) closeConsole();
        else openConsole();
      }
    });

    // ?console=1 в URL
    try {
      var url = new URL(location.href);
      if (url.searchParams.get('console') === '1') {
        setTimeout(openConsole, 700);
      }
    } catch (e) {}

    // Кнопка в админ-панели (если есть)
    var openBtn = document.querySelector('[data-open-console]');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        closeConsole(); // на всякий случай
        openConsole();
      });
    }

    // Пометить событие "visited_story", если мы на story.html
    if (/story\.html?$/i.test(location.pathname)) {
      markEvent('visited_story');
    }

    // Пометить событие "console_seen", когда открыл первый раз
    markEvent('console_seen');
  }

  /* ============================================================
     ПУБЛИЧНЫЙ API (для других модулей)
     ============================================================ */
  window.SpodzhSecrets = {
    progress: function () { return progress; },
    markEvent: markEvent,
    markFound: markFound,
    bumpGhost: function () {
      progress.ghost_interactions++;
      saveProgress(progress);
    },
    openConsole: openConsole,
    closeConsole: closeConsole,
    findSecret: findSecret,
    list: function () { return SECRET_FILES.slice(); }
  };

  /* ============================================================
     ЗАПУСК
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('%c[secrets] module loaded · нажми ~ для консоли', 'color:#ffd93d; font-family:monospace;');
})();