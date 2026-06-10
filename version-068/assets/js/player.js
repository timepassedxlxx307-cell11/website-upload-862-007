(function () {
    window.initializeMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movieVideo');
        var cover = document.getElementById('playerCover');
        var button = document.getElementById('playButton');
        var attached = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        var attachStream = function () {
            if (attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            attached = true;
        };

        var startPlayback = function () {
            attachStream();
            video.controls = true;

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playTask = video.play();

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    };
})();
