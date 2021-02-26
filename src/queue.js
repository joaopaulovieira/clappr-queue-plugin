import { CorePlugin, Events, version } from '@clappr/core'

export default class QueuePlugin extends CorePlugin {
  get name() { return 'queue' }

  get supportedVersion() { return { min: version } }

  get config() { return this.options.queue || {} }

  get videoQueue() { return this._videoQueue }

  constructor(core) {
    super(core)
    this._videoQueue = this.config.nextVideos || []
    this.startNextVideo = typeof this.config.autoPlayNextVideo !== 'boolean' && true || this.config.autoPlayNextVideo
  }

  getExternalInterface() {
    return {
      getVideoQueue: () => this.videoQueue,
      appendVideoOnQueue: data => this.appendVideo(data),
      prependVideoOnQueue: data => this.prependVideo(data),
      shiftVideoFromQueue: () => this.shiftVideo(),
      popVideoFromQueue: () => this.popVideo(),
    }
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
    const video = this._videoQueue.shift()
    this.playVideo(video)
  }

  playVideo(video) {
    video && this.core.load(video)
    this.startNextVideo && video && !this.options.autoPlay && this.container.play()
  }

  appendVideo(data) {
    Array.isArray(data)
      ? this._videoQueue.push(...data)
      : this._videoQueue.push(data)
  }

  prependVideo(data) {
    Array.isArray(data)
      ? this._videoQueue.unshift(...data)
      : this._videoQueue.unshift(data)
  }

  shiftVideo() {
    this._videoQueue.shift()
  }

  popVideo() {
    this._videoQueue.pop()
  }
}
