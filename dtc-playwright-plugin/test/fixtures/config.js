import {PlaywrightRunner} from '../../dist/PlaywrightRunner.js'
import {PlaywrightPlugin} from '../../dist/PlaywrightPlugin.js'

export default {
  runner: new PlaywrightRunner(),

  plugins: (_basePath, _testCase) => ({
    playwright: [new PlaywrightPlugin()],
  })
}
