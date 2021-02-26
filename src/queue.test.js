import { Events, Core, Container, Playback, version } from '@clappr/core'
import QueuePlugin from './queue'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new QueuePlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('QueuePlugin', () => {
  test('is loaded on core plugins array', () => {
    const { core, plugin } = setupTest()
    expect(core.getPlugin(plugin.name).name).toEqual('queue')
  })

  test('is compatible with the latest Clappr core version', () => {
    const { core, plugin } = setupTest()
    expect(core.getPlugin(plugin.name).supportedVersion).toEqual({ min: version })
  })

  test('is destroyed when Core is destroyed too', () => {
    const { core, plugin } = setupTest()
    jest.spyOn(plugin, 'destroy')
    core.destroy()

    expect(plugin.destroy).toHaveBeenCalled()
  })

  test('have a getter called config', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'config').get).toBeTruthy()
  })

  describe('config getter', () => {
    test('returns current plugin options on player reference', () => {
      const { core, plugin } = setupTest({ queue: {} })
      expect(plugin.config).toEqual(core.options.queue)
    })

    test('returns a empty object if plugin options don\'t exists', () => {
      const { plugin } = setupTest()
      expect(plugin.config).toEqual({})
    })
  })

  test('have a getter called videoQueue', () => {
    const { plugin } = setupTest()
    expect(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(plugin), 'videoQueue').get).toBeTruthy()
  })

  test('videoQueue getter returns _videoQueue value', () => {
    const { plugin } = setupTest()
    expect(plugin.videoQueue).toEqual(plugin._videoQueue)
  })

  describe('constructor', () => {
    test('sets _videoQueue property value based on nextVideos config', () => {
      const { plugin } = setupTest({ queue: { nextVideos: ['http://some-cool-webpage/path/some-cool-video.mp4'] } })
      expect(plugin._videoQueue).toEqual(plugin.config.nextVideos)
    })

    test('sets videoQueue property default value if nextVideos config don\'t exists', () => {
      const { plugin } = setupTest({ queue: {} })
      expect(plugin._videoQueue).toEqual([])
    })

    test('sets startNextVideo property value based on autoPlayNextVideo config', () => {
      const { plugin } = setupTest({ queue: { autoPlayNextVideo: false } })
      expect(plugin.startNextVideo).toEqual(plugin.config.autoPlayNextVideo)
    })

    test('sets startNextVideo property default value if autoPlayNextVideo config don\'t exists', () => {
      const { plugin } = setupTest({ queue: {} })
      expect(plugin.startNextVideo).toBeTruthy()
    })

    test('always call bindEvents via super', () => {
      jest.spyOn(QueuePlugin.prototype, 'bindEvents')
      setupTest()

      expect(QueuePlugin.prototype.bindEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('bindEvents method', () => {
    test('stops the current listeners before add new ones', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'stopListening')
      plugin.bindEvents()

      expect(plugin.stopListening).toHaveBeenCalledTimes(1)
    })

    test('register onContainerChanged method as callback for CORE_ACTIVE_CONTAINER_CHANGED event', () => {
      jest.spyOn(QueuePlugin.prototype, 'onContainerChanged')
      const { core, plugin } = setupTest()
      core.trigger(Events.CORE_ACTIVE_CONTAINER_CHANGED)

      expect(plugin.onContainerChanged).toHaveBeenCalledTimes(1)
    })
  })

  describe('bindContainerEvents method', () => {
    test('avoid register callback for events on container scope without a valid reference', () => {
      const { container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'playNextVideo')
      container.trigger(Events.CONTAINER_ENDED)

      expect(plugin.playNextVideo).not.toHaveBeenCalled()
    })

    test('register playNextVideo method as callback for CONTAINER_ENDED event', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'playNextVideo')
      core.activeContainer = container
      container.trigger(Events.CONTAINER_ENDED)

      expect(plugin.playNextVideo).toHaveBeenCalledTimes(1)
    })
  })

  describe('onContainerChanged method', () => {
    test('removes all listeners from old container reference', () => {
      const { core, container, plugin } = setupTest({}, true)
      jest.spyOn(plugin, 'stopListening')
      core.activeContainer = container
      plugin.onContainerChanged()

      expect(plugin.stopListening).toHaveBeenCalledWith(container)
    })

    test('saves core.activeContainer reference locally', () => {
      const { core, container, plugin } = setupTest({}, true)
      core.activeContainer = container
      plugin.onContainerChanged()

      expect(plugin.container).toEqual(core.activeContainer)
    })

    test('calls bindContainerEvents method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'bindContainerEvents')
      plugin.onContainerChanged()

      expect(plugin.bindContainerEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('playNextVideo method', () => {
    test('removes the first item on videoQueue array', () => {
      const { core, container, plugin } = setupTest({
        source: 'http://cool-webpage/path/first-cool-video.mp4',
        queue: {
          nextVideos: [
            'http://cool-webpage/path/some-cool-video.mp4',
            'http://another-cool-webpage/path/another-cool-video.mp4',
          ],
        },
      }, true)
      core.activeContainer = container
      jest.spyOn(plugin, 'playVideo').mockImplementation(() => {})
      plugin.playNextVideo()

      expect(plugin.videoQueue).toEqual(['http://another-cool-webpage/path/another-cool-video.mp4'])
    })

    test('calls playVideo with requested media', () => {
      const media = 'http://some-cool-webpage/path/some-cool-video.mp4'
      const { core, container, plugin } = setupTest({ queue: { nextVideos: [media] } }, true)
      core.activeContainer = container
      jest.spyOn(plugin, 'playVideo').mockImplementation(() => {})
      plugin.playNextVideo()

      expect(plugin.playVideo).toHaveBeenCalledWith(media)
    })
  })

  describe('playVideo method', () => {
    const media = 'http://some-cool-webpage/path/some-cool-video.mp4'

    test('ignores one invalid received media', () => {
      const { core, container, plugin } = setupTest({}, true)
      core.activeContainer = container
      jest.spyOn(core, 'load')
      plugin.playVideo(null)

      expect(core.load).not.toHaveBeenCalled()
    })

    test('loads the received media', () => {
      const { core, container, plugin } = setupTest({ queue: { nextVideos: [media] } }, true)
      core.activeContainer = container
      jest.spyOn(core, 'load').mockImplementation(() => {})
      jest.spyOn(container, 'play').mockImplementation(() => {})
      plugin.playVideo(media)

      expect(core.load).toHaveBeenCalledWith(media)
    })

    test('autoplay the next video by default', () => {
      const { core, container, plugin } = setupTest({ queue: { nextVideos: [media] } }, true)
      core.activeContainer = container
      jest.spyOn(core, 'load').mockImplementation(() => {})
      jest.spyOn(container, 'play').mockImplementation(() => {})
      plugin.playVideo(media)

      expect(container.play).toHaveBeenCalledTimes(1)
    })

    test('avoid autoplay the next video if autoPlayNextVideo config is false', () => {
      const { core, container, plugin } = setupTest({
        queue: {
          nextVideos: [media],
          autoPlayNextVideo: false,
        },
      }, true)
      core.activeContainer = container
      jest.spyOn(core, 'load').mockImplementation(() => {})
      jest.spyOn(container, 'play').mockImplementation(() => {})
      plugin.playVideo()

      expect(container.play).not.toHaveBeenCalled()
    })
  })

  describe('appendVideo method', () => {
    const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
    const videoURLExample2 = 'http://another-webpage/path/first-cool-video.mp4'

    test('adds url at the final of the queue', () => {
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1] } })
      plugin.appendVideo(videoURLExample2)

      expect(plugin.videoQueue[1]).toEqual(videoURLExample2)
    })

    test('supports adding a array of urls on the queue', () => {
      const { plugin } = setupTest()
      plugin.appendVideo([videoURLExample1, videoURLExample2])

      expect(plugin.videoQueue).toEqual([videoURLExample1, videoURLExample2])
    })
  })

  describe('prependVideo method', () => {
    const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
    const videoURLExample2 = 'http://another-webpage/path/first-cool-video.mp4'

    test('adds url at the top of the queue', () => {
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1] } })
      plugin.prependVideo(videoURLExample2)

      expect(plugin.videoQueue[0]).toEqual(videoURLExample2)
    })

    test('supports adding a array of urls on the queue', () => {
      const { plugin } = setupTest()
      plugin.prependVideo([videoURLExample1, videoURLExample2])

      expect(plugin.videoQueue).toEqual([videoURLExample1, videoURLExample2])
    })
  })

  describe('shiftVideo method', () => {
    test('removes url at the top of the queue', () => {
      const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
      const videoURLExample2 = 'http://another-webpage/path/first-cool-video.mp4'
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1, videoURLExample2] } })
      plugin.shiftVideo()

      expect(plugin.videoQueue).toEqual([videoURLExample2])
    })
  })

  describe('popVideo method', () => {
    test('removes url at the end of the queue', () => {
      const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
      const videoURLExample2 = 'http://another-webpage/path/first-cool-video.mp4'
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1, videoURLExample2] } })
      plugin.popVideo()

      expect(plugin.videoQueue).toEqual([videoURLExample1])
    })
  })

  describe('getExternalInterface method', () => {
    test('exposes videoQueue getter for player scope with getVideoQueue name', () => {
      const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1] } })
      const externalInterface = plugin.getExternalInterface()
      const videoQueue = externalInterface.getVideoQueue()

      expect(videoQueue).toEqual(plugin.videoQueue)
      expect(videoQueue[0]).toEqual(videoURLExample1)
    })

    test('exposes appendVideo method for player scope with appendVideoOnQueue name', () => {
      const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
      const videoURLExample2 = 'http://another-webpage/path/first-cool-video.mp4'
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1] } })
      const externalInterface = plugin.getExternalInterface()
      externalInterface.appendVideoOnQueue(videoURLExample2)

      expect(plugin.videoQueue[1]).toEqual(videoURLExample2)
    })

    test('exposes prependVideo method for player scope with prependVideoOnQueue name', () => {
      const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
      const videoURLExample2 = 'http://another-webpage/path/first-cool-video.mp4'
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1] } })
      const externalInterface = plugin.getExternalInterface()
      externalInterface.prependVideoOnQueue(videoURLExample2)

      expect(plugin.videoQueue[0]).toEqual(videoURLExample2)
    })

    test('exposes shiftVideo method for player scope with shiftVideoFromQueue name', () => {
      const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
      const videoURLExample2 = 'http://another-webpage/path/first-cool-video.mp4'
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1, videoURLExample2] } })
      const externalInterface = plugin.getExternalInterface()
      externalInterface.shiftVideoFromQueue()

      expect(plugin.videoQueue).toEqual([videoURLExample2])
    })

    test('exposes popVideo method for player scope with popVideoFromQueue name', () => {
      const videoURLExample1 = 'http://cool-webpage/path/first-cool-video.mp4'
      const videoURLExample2 = 'http://another-webpage/path/first-cool-video.mp4'
      const { plugin } = setupTest({ queue: { nextVideos: [videoURLExample1, videoURLExample2] } })
      const externalInterface = plugin.getExternalInterface()
      externalInterface.popVideoFromQueue()

      expect(plugin.videoQueue).toEqual([videoURLExample1])
    })
  })
})
