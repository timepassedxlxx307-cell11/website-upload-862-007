(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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
        }

        function move(step) {
            show(current + step);
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                move(1);
            }, 5600);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                move(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                move(1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        show(0);
        restart();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-search-input]');
        var clearButton = root.querySelector('[data-search-clear]');
        var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var selected = 'all';
        var empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = '没有找到匹配影片';

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var channel = card.getAttribute('data-channel') || '';
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchFilter = selected === 'all' || haystack.indexOf(selected.toLowerCase()) !== -1 || channel === selected;
                var shouldShow = matchKeyword && matchFilter;
                card.classList.toggle('is-hidden-by-filter', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });
            var grid = document.querySelector('.movie-grid') || document.querySelector('.rank-list');
            if (grid) {
                if (!visible && !empty.parentNode) {
                    grid.appendChild(empty);
                }
                if (visible && empty.parentNode) {
                    empty.parentNode.removeChild(empty);
                }
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (clearButton && input) {
            clearButton.addEventListener('click', function () {
                input.value = '';
                selected = 'all';
                chips.forEach(function (chip) {
                    chip.classList.toggle('is-active', chip.getAttribute('data-filter') === 'all');
                });
                apply();
                input.focus();
            });
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                selected = chip.getAttribute('data-filter') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
            if (chip.getAttribute('data-filter') === 'all') {
                chip.classList.add('is-active');
            }
        });

        apply();
    });

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var source = shell.getAttribute('data-video');
        var hlsInstance = null;

        function start() {
            if (!video || !source) {
                return;
            }

            if (video.getAttribute('data-ready') !== 'true') {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute('data-ready', 'true');
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video) {
                start();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
})();
