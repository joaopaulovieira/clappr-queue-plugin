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
      jest.spyOn(core, 'load').mockImplementation(() => {})
      jest.spyOn(container, 'play').mockImplementation(() => {})
      plugin.playNextVideo()

      expect(plugin.videoQueue).toEqual(['http://another-cool-webpage/path/another-cool-video.mp4'])
    })

    test('loads the first item on videoQueue array', () => {
      const { core, container, plugin } = setupTest({ queue: { nextVideos: ['http://some-cool-webpage/path/some-cool-video.mp4'] } }, true)
      core.activeContainer = container
      jest.spyOn(core, 'load').mockImplementation(() => {})
      jest.spyOn(container, 'play').mockImplementation(() => {})
      plugin.playNextVideo()

      expect(core.load).toHaveBeenCalledWith('http://some-cool-webpage/path/some-cool-video.mp4')
    })
  })
})
