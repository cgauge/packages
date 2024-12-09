import type {TestCase, TestCaseExecution} from './domain'
import {retry} from './utils.js'
import {dirname} from 'node:path'
import test from 'node:test'

export type * from './domain'
export * from './utils.js'
export * from './config.js'
export * from './loader.js'

export const defaultTestRunner = async (testCaseExecutions: TestCaseExecution[], plugins: string[]) => {
  for (const {filePath, testCase} of testCaseExecutions) {
    test(testCase.name, (args) => executeTestCase(testCase, plugins, filePath, args))
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
    await Promise.all(
      plugins
        .map((module) => {
          const normalizedData: unknown[] = Array.isArray(data) ? data : [data]
          return normalizedData.map((x) => module[functionName]?.(x, basePath, testRunnerArgs))
        })
        .flat(),
    )
  }

export const executeTestCase = async (
  testCase: TestCase,
  plugins: string[],
  filePath: string,
  testRunnerArgs?: unknown,
) => {
  const basePath = dirname(filePath)

  if (!plugins) {
    throw new Error('No plugins defined.')
  }

  const loadedPlugins = await Promise.all(plugins.map((plugin) => import(plugin)))
  const executePluginFunction = preparePluginFunction(loadedPlugins, basePath, testRunnerArgs)

  if (testCase.layers) {
    await Promise.all(testCase.layers.filter((v) => v.arrange).map((v) => executePluginFunction('arrange', v.arrange)))
  }

  if (testCase.arrange) {
    await executePluginFunction('arrange', testCase.arrange)
  }

  if (testCase.act) {
    await executePluginFunction('act', testCase.act)
  }

  if (testCase.assert) {
    await retry(() => executePluginFunction('assert', testCase.assert), testCase.retry, testCase.delay)
  }

  if (testCase.layers) {
    await Promise.all(testCase.layers.filter((v) => v.clean).map((v) => executePluginFunction('clean', v.clean)))
  }

  if (testCase.clean) {
    await executePluginFunction('clean', testCase.clean)
  }
}
