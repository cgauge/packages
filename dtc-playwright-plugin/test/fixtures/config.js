import {PlaywrightRunner} from '../../src/PlaywrightRunner.js'
import {PlaywrightPlugin} from '../../src/PlaywrightPlugin.js'

export default {
  runner: new PlaywrightRunner(),

  plugins: (_basePath, _testCase) => ({
    playwright: [new PlaywrightPlugin()],
  })
}
