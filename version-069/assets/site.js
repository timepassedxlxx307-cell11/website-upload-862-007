(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var next = hero.querySelector("[data-hero-next]");
      var prev = hero.querySelector("[data-hero-prev]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === index);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === index);
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
          timer = null;
        }
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      dots.forEach(function (dot, itemIndex) {
        dot.addEventListener("click", function () {
          show(itemIndex);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var kindFilter = document.querySelector("[data-kind-filter]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-scope .movie-card"));
    var empty = document.querySelector(".empty-state");

    function applyFilters() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var kind = kindFilter ? kindFilter.value : "";
      var region = regionFilter ? regionFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardKind = card.getAttribute("data-kind") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (kind && cardKind !== kind) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [filterInput, kindFilter, regionFilter].forEach(function (node) {
      if (node) {
        node.addEventListener("input", applyFilters);
        node.addEventListener("change", applyFilters);
      }
    });

    var heroSearch = document.querySelector("[data-hero-search]");
    var heroButton = document.querySelector("[data-hero-search-button]");
    if (heroSearch && heroButton) {
      heroButton.addEventListener("click", function () {
        var value = heroSearch.value.trim();
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        }
      });
      heroSearch.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          heroButton.click();
        }
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && filterInput) {
      filterInput.value = query;
      applyFilters();
    }
  });
})();
