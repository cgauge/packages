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
  (plugins: any[], basePath: string, testRunnerArgs?: unknown) => async (functionName: string, data: unknown) => {
    if (!data) {
      return
    }

    const responses = await Promise.all(
      plugins
        .map((module) => {
          const normalizedData: unknown[] = Array.isArray(data) ? data : [data]
          return normalizedData.map((x) => module[functionName]?.(x, basePath, testRunnerArgs))
        })
        .flat(),
    )

    if (!responses.reduce((acc, cur) => acc || cur, false)) {
      throw new Error(`No actions (${functionName}) executed`)
    }
  }

export const executeTestCase = async (
  testCaseExecution: TestCaseExecution,
  plugins: string[],
  testRunnerArgs?: unknown,
) => {
  debug(`TestCase: ${JSON.stringify(testCaseExecution, null, 2)}`)
  debug(`TestRunnerArgs: ${JSON.stringify(testRunnerArgs, null, 2)}`)
  debug(`Plugins: ${JSON.stringify(plugins, null, 2)}`)

  const basePath = dirname(testCaseExecution.filePath)

  const loadedPlugins = await Promise.all(plugins.map((plugin) => import(plugin)))
  const executePluginFunction = preparePluginFunction(loadedPlugins, basePath, testRunnerArgs)
  const testCase = testCaseExecution.testCase

  if (testCaseExecution.layers) {
    await Promise.all(
      testCaseExecution.layers.filter((v) => v.arrange).map((v) => executePluginFunction('arrange', v.arrange)),
    )
  }

  await executePluginFunction('arrange', testCase.arrange)

  await executePluginFunction('act', testCase.act)

  await retry(() => executePluginFunction('assert', testCase.assert), testCase.retry, testCase.delay)

  await executePluginFunction('clean', testCase.clean)

  if (testCaseExecution.layers) {
    await Promise.all(
      testCaseExecution.layers.filter((v) => v.clean).map((v) => executePluginFunction('clean', v.clean)),
    )
  }
}
