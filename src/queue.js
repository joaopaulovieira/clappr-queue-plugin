import { CorePlugin, version } from '@clappr/core'

export default class QueuePlugin extends CorePlugin {
  get name() { return 'queue' }

  get supportedVersion() { return { min: version } }

  constructor(core) {
    super(core)
    console.log('plugin built!') // eslint-disable-line
  }
}
