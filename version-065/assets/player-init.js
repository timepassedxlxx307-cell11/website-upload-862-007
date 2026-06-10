(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  function bind(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-play-button]');
    var stream = root.getAttribute('data-stream');
    var started = false;
    var hls = null;

    function prepare() {
      if (!video || !stream || started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('controls', 'controls');

      if (button) {
        button.classList.add('is-hidden');
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    if (button) {
      button.addEventListener('click', prepare);
    }

    if (video) {
      video.addEventListener('click', prepare);
    }

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  players.forEach(bind);
})();
