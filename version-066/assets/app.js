(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function setSearchFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (!query) {
            return;
        }
        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            input.value = query;
        });
    }

    function fillFilterOptions(panel, cards) {
        var regionSelect = panel.querySelector("[data-filter-region]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var regions = [];
        var years = [];
        cards.forEach(function (card) {
            var region = card.getAttribute("data-region") || "";
            var year = card.getAttribute("data-year") || "";
            if (region && regions.indexOf(region) === -1) {
                regions.push(region);
            }
            if (year && years.indexOf(year) === -1) {
                years.push(year);
            }
        });
        regions.sort().forEach(function (region) {
            if (regionSelect) {
                var option = document.createElement("option");
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            }
        });
        years.sort(function (a, b) {
            return Number(b) - Number(a);
        }).forEach(function (year) {
            if (yearSelect) {
                var option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            }
        });
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        if (!panels.length) {
            return;
        }
        setSearchFromUrl();
        panels.forEach(function (panel) {
            var scope = panel.closest(".container") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var input = panel.querySelector("[data-filter-input]");
            var category = panel.querySelector("[data-filter-category]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            fillFilterOptions(panel, cards);

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var categoryValue = category ? category.value : "";
                var regionValue = region ? region.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
                    var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
                    var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    var show = matchesQuery && matchesCategory && matchesRegion && matchesYear;
                    card.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, category, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-player-start]");
            var source = shell.getAttribute("data-src");
            var hls = null;
            if (!video || !source || !button) {
                return;
            }

            function attachSource() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute("data-ready", "1");
            }

            function playVideo() {
                attachSource();
                shell.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }

            button.addEventListener("click", playVideo);
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                shell.classList.remove("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
