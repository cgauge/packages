import playwrightRunner from '../../src/playwright-runner.js'
import * as playwrightPlugin from '../../src/playwright-plugin.js'

export default {
  runner: playwrightRunner(),
  testRegex: /^(?!.*node_modules).*dtc-playwright-plugin\/.*\.dtc\.[jt]s?$/,
  plugins: [playwrightPlugin]
}
