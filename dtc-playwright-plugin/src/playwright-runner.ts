import {TestCaseExecution} from '@cgauge/dtc'
import {spawnSync} from 'node:child_process'
import nodeAssert from 'node:assert'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export default (constructorArgs?: string[]) =>
  async (testCaseExecutions: TestCaseExecution[], _plugins: string[], runnerArgs: string[], config?: string) => {
    const args = [...runnerArgs,  ...constructorArgs ?? []]
    const childProcess = spawnSync(`npx playwright test ${args?.join(' ')} ${__dirname}`, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        ...(testCaseExecutions.length === 1 && {DTC_PLAYWRIGHT_PATH: testCaseExecutions[0].filePath}),
        DTC_PLAYWRIGHT_CONFIG: config,
      },
    })

    nodeAssert.equal(childProcess.status, 0)
  }
