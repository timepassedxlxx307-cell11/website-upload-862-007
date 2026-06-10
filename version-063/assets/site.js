(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (menuButton && siteNav) {
        menuButton.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var normalize = function (value) {
        return (value || '').toString().trim().toLowerCase();
    };

    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
        var input = group.querySelector('[data-search-input]');
        var selects = Array.prototype.slice.call(group.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(group.querySelectorAll('[data-movie-card]'));

        var applyFilter = function () {
            var keyword = normalize(input ? input.value : '');

            cards.forEach(function (card) {
                var matched = true;
                var haystack = normalize(card.getAttribute('data-search'));

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                selects.forEach(function (select) {
                    var key = select.getAttribute('data-filter-key');
                    var value = normalize(select.value);
                    var cardValue = normalize(card.getAttribute('data-' + key));

                    if (value && cardValue !== value) {
                        matched = false;
                    }
                });

                card.classList.toggle('is-hidden', !matched);
            });
        };

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilter);
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('[data-player-video]');
        var button = player.querySelector('[data-play-button]');
        var stream = player.getAttribute('data-stream');
        var hlsInstance = null;
        var loaded = false;

        var startPlayback = function () {
            if (!video || !stream) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    loaded = true;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    loaded = true;
                } else {
                    video.src = stream;
                    loaded = true;
                }
            }

            if (button) {
                button.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    startPlayback();
                }
            });

            video.addEventListener('ended', function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
