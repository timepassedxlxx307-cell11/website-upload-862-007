(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initSearch() {
    var input = document.querySelector(".movie-search");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .category-tile, .category-overview"));
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-filtered-out", value !== "" && text.indexOf(value) === -1);
      });
    });
  }

  function setupPlayer(videoId, buttonId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    if (!video || !button || !overlay || !streamUrl) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      attach();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      play();
    });
    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!attached) {
        play();
      }
    });
  }

  window.setupPlayer = setupPlayer;

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
