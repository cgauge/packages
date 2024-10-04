import {Runner, TestCaseExecution, Plugins} from '@cgauge/dtc'
import {spawnSync} from 'node:child_process'
import nodeAssert from 'node:assert'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export class PlaywrightRunner implements Runner {
  constructor(private args: string[] = []) {}

  async run(testCaseExecutions: TestCaseExecution[], _plugins: Plugins, type: string, config?: string) {
    const childProcess = spawnSync(`npx playwright test ${this.args.join(' ')} ${__dirname}`, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...(testCaseExecutions.length === 1 && {DTC_PLAYWRIGHT_PATH: testCaseExecutions[0].filePath}),
        DTC_PLAYWRIGHT_TYPE: type,
        DTC_PLAYWRIGHT_CONFIG: config,
      },
    })

    nodeAssert.equal(childProcess.status, 0)
  }
}
