(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function text(value) {
    return (value || '').toString().toLowerCase();
  }

  function setupMenu() {
    var button = one('.menu-toggle');
    var menu = one('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = button.classList.toggle('is-open');
      menu.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = null;
    }

    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupRails() {
    all('[data-rail-left], [data-rail-right]').forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-rail-left') || button.getAttribute('data-rail-right');
        var rail = document.getElementById(targetId);
        if (!rail) {
          return;
        }
        var direction = button.hasAttribute('data-rail-left') ? -1 : 1;
        rail.scrollBy({ left: direction * 360, behavior: 'smooth' });
      });
    });
  }

  function setupSearchForms() {
    all('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = one('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        var url = new URL(form.getAttribute('action') || './search.html', window.location.href);
        if (query) {
          url.searchParams.set('q', query);
        } else {
          url.searchParams.delete('q');
        }
        window.location.href = url.pathname.split('/').pop() + url.search;
      });
    });
  }

  function setupFilters() {
    all('[data-filter-panel]').forEach(function (panel) {
      var input = one('[data-filter-input]', panel);
      var year = one('[data-filter-year]', panel);
      var cards = all('.movie-card, .list-card', panel);
      var empty = one('[data-empty-state]', panel);
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (input && initial) {
        input.value = initial;
      }

      function apply() {
        var keyword = text(input ? input.value : '').trim();
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year')
          ].map(text).join(' ');
          var matchText = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var match = matchText && matchYear;
          card.style.display = match ? '' : 'none';
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      apply();
    });
  }

  function setupPlayers() {
    all('[data-player]').forEach(function (shell) {
      var video = one('video', shell);
      var cover = one('.player-cover', shell);
      var play = shell.getAttribute('data-play');
      var hlsInstance = null;
      if (!video || !play) {
        return;
      }

      function begin() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = play;
          }
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(play);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.play().catch(function () {});
          }
          return;
        }
        if (!video.src) {
          video.src = play;
        }
        video.play().catch(function () {});
      }

      if (cover) {
        cover.addEventListener('click', begin);
      }
      video.addEventListener('click', function () {
        if (!video.src) {
          begin();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupRails();
    setupSearchForms();
    setupFilters();
    setupPlayers();
  });
})();
