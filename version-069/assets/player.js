(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var url = player.getAttribute("data-video-url") || "";
      var loaded = false;
      var hls = null;

      function loadMedia() {
        if (loaded || !video || !url) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          return;
        }

        video.src = url;
      }

      function startPlay() {
        loadMedia();
        player.classList.add("is-playing");
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlay);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlay();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.currentTime) {
            player.classList.remove("is-playing");
          }
        });
      }
    });
  });
})();
