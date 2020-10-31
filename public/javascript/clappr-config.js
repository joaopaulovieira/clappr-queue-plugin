const playerElement = document.getElementById('player-wrapper')

const player = new Clappr.Player({
  source: 'http://clappr.io/highline.mp4',
  poster: 'http://clappr.io/poster.png',
  playback: { controls: true },
  queue: {
    nextVideos: ['https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1920_18MG.mp4'],
    autoPlayNextVideo: true,
  },
  plugins: [window.QueuePlugin],
})

player.attachTo(playerElement)
