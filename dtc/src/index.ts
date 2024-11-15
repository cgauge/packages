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

  if (testCase.arrange) {
    await Promise.all(loadedPlugins.map(({arrange}) => arrange?.(testCase.arrange, basePath, testRunnerArgs)))
  }

  if (testCase.act) {
    await Promise.all(loadedPlugins.map(({act}) => act?.(testCase.act, basePath, testRunnerArgs)))
  }

  if (testCase.assert) {
    await Promise.all(
      loadedPlugins.map(({assert}) =>
        retry(async () => assert?.(testCase.assert, basePath, testRunnerArgs), testCase.retry ?? 0, testCase.delay ?? 0),
      ),
    )
  }
  
  if (testCase.clean) {
    await Promise.all(loadedPlugins.map(({clean}) => clean?.(testCase.clean, basePath, testRunnerArgs)))
  }
}
