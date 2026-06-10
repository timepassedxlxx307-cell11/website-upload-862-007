(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-card-filter]').forEach(function (input) {
        input.addEventListener('input', function () {
            var scope = input.closest('[data-card-scope]') || document;
            var value = input.value.trim().toLowerCase();
            scope.querySelectorAll('[data-movie-card]').forEach(function (card) {
                var text = card.getAttribute('data-search-text') || '';
                card.classList.toggle('is-hidden-card', value && text.indexOf(value) === -1);
            });
        });
    });

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var queryInput = searchPage.querySelector('[name="q"]');
        var regionSelect = searchPage.querySelector('[name="region"]');
        var typeSelect = searchPage.querySelector('[name="type"]');
        var genreSelect = searchPage.querySelector('[name="genre"]');

        if (queryInput) {
            queryInput.value = params.get('q') || '';
        }

        var applySearch = function () {
            var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var genre = genreSelect ? genreSelect.value : '';

            searchPage.querySelectorAll('[data-movie-card]').forEach(function (card) {
                var text = card.getAttribute('data-search-text') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardGenre = card.getAttribute('data-genre') || '';
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (region && cardRegion !== region) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                if (genre && cardGenre.indexOf(genre) === -1) {
                    matched = false;
                }

                card.classList.toggle('is-hidden-card', !matched);
            });
        };

        [queryInput, regionSelect, typeSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applySearch);
                control.addEventListener('change', applySearch);
            }
        });

        var form = searchPage.querySelector('form');

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applySearch();
            });
        }

        applySearch();
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;

        var showSlide = function (index) {
            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(active - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
            });
        }

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }
    }
})();
