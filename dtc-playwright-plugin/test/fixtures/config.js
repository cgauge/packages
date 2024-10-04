import {PlaywrightRunner} from '../../src/PlaywrightRunner.js'
import {PlaywrightPlugin} from '../../src/PlaywrightPlugin.js'

export default {
  runner: new PlaywrightRunner(),

  testRegex: /^(?!.*node_modules).*dtc-playwright-plugin\/.*\.dtc\.[jt]s?$/,

  plugins: {
    playwright: [new PlaywrightPlugin()],
  },
}
