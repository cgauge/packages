import type {TestCaseExecution} from './domain'
import {debug, retry} from './utils.js'
import {dirname} from 'node:path'
import test from 'node:test'

export type * from './domain'
export * from './utils.js'
export * from './config.js'
export * from './loader.js'

export const defaultTestRunner = async (testCaseExecutions: TestCaseExecution[], plugins: string[]) => {
  for (const testCaseExecution of testCaseExecutions) {
    test(testCaseExecution.testCase.name, (args) => executeTestCase(testCaseExecution, plugins, args))
  }
}

export const defaultLoader = async (filePath: string) => (await import(filePath)).default

export const defaultPlugins = [
  './plugins/disable-net-connect-plugin.js',
  './plugins/function-call-plugin.js',
  './plugins/http-mock-plugin.js',
]

const preparePluginFunction =
  (plugins: any[], basePath: string, testRunnerArgs?: unknown) => async (functionName: string, data: unknown) =>
    Promise.all(
      plugins
        .map((module) => {
          const normalizedData: unknown[] = Array.isArray(data) ? data : [data]
          return normalizedData.map((x) => module[functionName]?.(x, basePath, testRunnerArgs))
        })
        .flat(),
    )

export const executeTestCase = async (
  testCaseExecution: TestCaseExecution,
  plugins: string[],
  testRunnerArgs?: unknown,
) => {
  debug(`TestCase: ${JSON.stringify(testCaseExecution, null, 2)}`)
  debug(`TestRunnerArgs: ${JSON.stringify(testRunnerArgs, null, 2)}`)

  const basePath = dirname(testCaseExecution.filePath)

  debug(`Plugins: ${JSON.stringify(plugins, null, 2)}`)

  const loadedPlugins = await Promise.all(plugins.map((plugin) => import(plugin)))
  const executePluginFunction = preparePluginFunction(loadedPlugins, basePath, testRunnerArgs)
  const testCase = testCaseExecution.testCase

  if (testCaseExecution.layers) {
    await Promise.all(
      testCaseExecution.layers.filter((v) => v.arrange).map((v) => executePluginFunction('arrange', v.arrange)),
    )
  }

  if (testCase.arrange) {
    await executePluginFunction('arrange', testCase.arrange)
  }

  if (testCase.act) {
    const acts = await executePluginFunction('act', testCase.act)
    
    if (! acts.reduce((acc, cur) => acc || cur, false)) {
      throw new Error('No actions executed')
    }
  }

  if (testCase.assert) {
    await retry(() => executePluginFunction('assert', testCase.assert), testCase.retry, testCase.delay)
  }

  if (testCase.clean) {
    await executePluginFunction('clean', testCase.clean)
  }

  if (testCaseExecution.layers) {
    await Promise.all(
      testCaseExecution.layers.filter((v) => v.clean).map((v) => executePluginFunction('clean', v.clean)),
    )
  }
}
