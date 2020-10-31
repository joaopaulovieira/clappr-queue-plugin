import { CorePlugin, Events, version } from '@clappr/core'

export default class QueuePlugin extends CorePlugin {
  get name() { return 'queue' }

  get supportedVersion() { return { min: version } }

  get config() { return this.options.queue || {} }

  constructor(core) {
    super(core)
    this.videoQueue = this.config.nextVideos || []
    this.startNextVideo = typeof this.config.autoPlayNextVideo !== 'boolean' && true || this.config.autoPlayNextVideo
  }

  bindEvents() {
    this.stopListening()
    this.listenTo(this.core, Events.CORE_ACTIVE_CONTAINER_CHANGED, this.onContainerChanged)
  }

  bindContainerEvents() {
    this.container && this.listenTo(this.container, Events.CONTAINER_ENDED, this.playNextVideo)
  }

  onContainerChanged() {
    this.container && this.stopListening(this.container)
    this.container = this.core.activeContainer
    this.bindContainerEvents()
  }

  playNextVideo() {
    const nextVideo = this.videoQueue.shift()
    nextVideo && this.core.load(nextVideo)
    this.startNextVideo && nextVideo && !this.options.autoPlay && this.container.play()
  }
}
