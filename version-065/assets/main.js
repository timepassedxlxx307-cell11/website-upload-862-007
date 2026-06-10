(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    activate(0);
    start();
  }

  var panel = document.querySelector('[data-filter-panel]');

  if (panel) {
    var input = panel.querySelector('[data-search-input]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-results] .movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        var matchedRegion = !region || cardRegion === region;
        card.classList.toggle('is-filter-hidden', !(matchedKeyword && matchedYear && matchedRegion));
      });
    }

    [input, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
