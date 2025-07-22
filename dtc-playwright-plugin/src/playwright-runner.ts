import {TestCaseExecution} from '@cgauge/dtc'
import {spawnSync} from 'node:child_process'
import nodeAssert from 'node:assert'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export default (constructorArgs?: string[]) =>
  async (_testCaseExecutions: TestCaseExecution[], _plugins: string[], runnerArgs: string[], config?: string, filePath?: string) => {
    const args = ['playwright', 'test', ...runnerArgs,  ...constructorArgs ?? [], __dirname]
    const childProcess = spawnSync('npx', args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        DTC_PLAYWRIGHT_PATH: filePath,
        DTC_PLAYWRIGHT_CONFIG: config,
      },
    })

    nodeAssert.equal(childProcess.status, 0)
  }
