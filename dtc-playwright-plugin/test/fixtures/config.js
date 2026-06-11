import playwrightRunner from '../../src/playwright-runner.js'
import * as playwrightPlugin from '../../src/playwright-plugin.js'

export default {
  runner: playwrightRunner(),
  testPattern: './**/*.dtc.{ts,js}',
  plugins: [playwrightPlugin]
}
