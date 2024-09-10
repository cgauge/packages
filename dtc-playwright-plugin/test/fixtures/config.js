import {PlaywrightBootPlugin} from '../../dist/PlaywrightBootPlugin.js'
import {PlaywrightPlugin} from '../../dist/PlaywrightPlugin.js'

export default {
  plugins: (basePath, _testCase) => ({
    boot: [new PlaywrightBootPlugin(basePath)],
    playwright: [new PlaywrightPlugin()],
  })
}
