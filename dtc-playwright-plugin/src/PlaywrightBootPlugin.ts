import {Plugin, TestCase, Plugins} from '@cgauge/dtc'
import {spawn} from 'node:child_process'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export class PlaywrightBootPlugin implements Plugin {
  async boot(path: string, _testCase: TestCase, _plugins: Plugins, type: string, config?: string) {
    spawn(`npx playwright test ${__dirname}browser.spec.js`, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      env: {
        ...process.env,
        DTC_PLAYWRIGHT_FILE_PATH: path,
        DTC_PLAYWRIGHT_TYPE: type,
        DTC_PLAYWRIGHT_CONFIG: config,
      },
    })
  }
}
