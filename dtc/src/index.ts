import type {TestCase, TestCaseExecution} from './domain'
import {debug, retry} from './utils.js'
import {dirname} from 'node:path'
import test from 'node:test'

export type * from './domain'
export * from './utils.js'
export * from './config.js'
export * from './loader.js'

export const defaultTestRunner = async (testCaseExecutions: TestCaseExecution[], plugins: string[]) => {
  for (const testCaseExecution of testCaseExecutions) {
    test(testCaseExecution.testCase.name ?? testCaseExecution.filePath, (args) => executeTestCase(testCaseExecution, plugins, args))
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

const useRunSafe = (
  testCaseExecution: TestCaseExecution,
  executePluginFunction: (functionName: string, data: unknown) => Promise<void>
) => {
  let errors: Error[] = []

  const runSafe = async (step: string, testCase: TestCase) => {
    try {
      if (!testCase[step] || (errors.length > 0 && step !== 'clean')) {
        return
      }
      await executePluginFunction(step, testCase[step])
    } catch (err: any) {
      err.name = `${step.charAt(0).toUpperCase() + step.slice(1)}Error`
      errors.push(err)
      debug(`${err.name}: ${err.message} \n${err.stack}`)
    }
  }

  const throwIfError = () => {
    if (errors.length > 0) {
      const error = new Error(`TestCase: ${testCaseExecution.testCase.name ?? testCaseExecution.filePath} \nErrors: ${errors.map((e) => `${e.name}: ${e.message}`).join(', ')}`)
      error.stack = errors.map((e) => e.stack).join('\n')
      error.name = 'TestCaseError'
      throw error
    }
  }

  return { runSafe, throwIfError }
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
  const { runSafe, throwIfError } = useRunSafe(testCaseExecution, executePluginFunction)

  if (testCaseExecution.resolvedLayers) {
    await Promise.all(
      testCaseExecution.resolvedLayers.filter((v) => v.arrange).map((v) => runSafe('arrange', v)),
    )
  }

  await runSafe('arrange', testCase)

  await runSafe('act', testCase)

  await retry(() => runSafe('assert', testCase), testCase.retry, testCase.delay)
  
  await runSafe('clean', testCase)

  if (testCaseExecution.resolvedLayers) {
    await Promise.all(
      testCaseExecution.resolvedLayers.filter((v) => v.clean).map((v) => runSafe('clean', v)),
    )
  }

  throwIfError()
}
