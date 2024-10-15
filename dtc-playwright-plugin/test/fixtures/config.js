import playwrightRunner from '../../src/playwright-runner.js'

export default {
  runner: playwrightRunner(),
  testRegex: /^(?!.*node_modules).*dtc-playwright-plugin\/.*\.dtc\.[jt]s?$/,
  plugins: ['../../dtc-playwright-plugin/src/playwright-plugin.js']
}
