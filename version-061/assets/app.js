(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.site-search')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function (form) {
        var input = form.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-card-list]');
        if (!input || !list) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            input.value = query;
        }

        function runFilter() {
            var words = normalize(input.value).split(/\s+/).filter(Boolean);
            var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
            cards.forEach(function (card) {
                var haystack = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '') + ' ' + card.textContent);
                var matched = words.length === 0 || words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
                card.classList.toggle('is-hidden', !matched);
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            runFilter();
        });
        input.addEventListener('input', runFilter);
        runFilter();
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play]');
        var stream = shell.getAttribute('data-stream');
        var isReady = false;
        var hlsInstance = null;

        if (!video || !stream || !button) {
            return;
        }

        function loadStream() {
            if (isReady) {
                return;
            }
            isReady = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function playVideo() {
            loadStream();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener('click', playVideo);
        shell.addEventListener('click', function (event) {
            if (event.target === video || event.target === button || button.contains(event.target)) {
                return;
            }
            playVideo();
        });
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
