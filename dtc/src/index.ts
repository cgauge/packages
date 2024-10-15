import type {TestCase, TestCaseExecution} from './domain'
import {retry} from './utils.js'
import {dirname} from 'node:path'
import test from 'node:test'

export type * from './domain'
export * from './utils.js'
export * from './config.js'
export * as DisableNetConnectPlugin from './plugins/disable-net-connect-plugin.js'
export * as FunctionCallPlugin from './plugins/function-call-plugin.js'

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

export const executeTestCase = async (
  testCase: TestCase,
  plugins: string[],
  filePath: string,
  testRunnerArgs?: unknown,
) => {
  const basePath = dirname(filePath)

  const loadedPlugins = await Promise.all(plugins.map((plugin) => import(plugin)))

  await Promise.all(loadedPlugins.map(({arrange}) => arrange?.(testCase.arrange, basePath, testRunnerArgs)))
  await Promise.all(loadedPlugins.map(({act}) => act?.(testCase.act, basePath, testRunnerArgs)))
  await Promise.all(
    loadedPlugins.map(({assert}) =>
      retry(async () => assert?.(testCase.assert, basePath, testRunnerArgs), testCase.retry ?? 0, testCase.delay ?? 0),
    ),
  )
  await Promise.all(loadedPlugins.map(({clean}) => clean?.(testCase.clean, basePath, testRunnerArgs)))
}
