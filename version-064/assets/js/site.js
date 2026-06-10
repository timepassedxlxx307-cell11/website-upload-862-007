(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      });
    });
  }

  function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const thumbs = Array.from(hero.querySelectorAll("[data-hero-thumb]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === index));
      dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle("is-active", thumbIndex === index));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    thumbs.forEach((thumb) => {
      thumb.addEventListener("mouseenter", () => {
        show(Number(thumb.dataset.heroThumb || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-area]").forEach((area) => {
      const input = area.querySelector("[data-search-input]");
      const buttons = Array.from(area.querySelectorAll("[data-filter-button]"));
      let cards = Array.from(area.querySelectorAll("[data-card]"));
      if (!cards.length) {
        cards = Array.from(document.querySelectorAll("[data-card]"));
      }
      let type = "all";

      const apply = () => {
        const query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach((card) => {
          const haystack = (card.dataset.search || "").toLowerCase();
          const cardType = card.dataset.type || "";
          const queryMatch = !query || haystack.includes(query);
          const typeMatch = type === "all" || cardType.includes(type);
          card.classList.toggle("is-hidden", !(queryMatch && typeMatch));
        });
      };

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          type = button.dataset.filterValue || "all";
          buttons.forEach((item) => item.classList.toggle("is-active", item === button));
          apply();
        });
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach((box) => {
      const video = box.querySelector("video");
      const button = box.querySelector("[data-play-button]");
      const url = box.dataset.video;
      let attached = false;
      let hls = null;

      if (!video || !button || !url) {
        return;
      }

      const attach = () => {
        if (attached) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          video.src = url;
        }
        attached = true;
      };

      const play = () => {
        attach();
        box.classList.add("is-playing");
        const request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(() => {
            box.classList.remove("is-playing");
          });
        }
      };

      button.addEventListener("click", play);
      video.addEventListener("play", () => box.classList.add("is-playing"));
      video.addEventListener("pause", () => {
        if (!video.ended) {
          box.classList.add("is-playing");
        }
      });
      video.addEventListener("ended", () => box.classList.remove("is-playing"));
      video.addEventListener("click", () => {
        if (!attached) {
          play();
        }
      });
      window.addEventListener("beforeunload", () => {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }
})();
