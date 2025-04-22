import type {TestCase, TestCaseExecution, TestCasePhases} from './domain'
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

const createPluginExecutor = (plugins: any[], basePath: string, testRunnerArgs?: unknown) => {
  return async (functionName: string, data: unknown) => {
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
}

const createPhaseExecutor = (
  executePluginFunction: (functionName: string, data: unknown) => Promise<void>,
  testCaseExecution: TestCaseExecution,
) => {
  const allowedLayerPhases = ['arrange', 'clean']

  const executePhase = async (phase: TestCasePhases, testCase: TestCase) => {
    if (!testCase[phase]) {
      return
    }

    if (phase === 'assert') {  
      await retry(() => executePluginFunction(phase, testCase[phase]), testCase.retry, testCase.delay)
    } else {
      await executePluginFunction(phase, testCase[phase])
    }
  }

  const executeLayerPhase = async (phase: TestCasePhases, layers: TestCase[]) => {
    await Promise.all(
      layers
        .filter((layer) => layer[phase])
        .map((layer) => executePhase(phase, layer))
    )
  }

  const execute = async (phase: TestCasePhases) => {
    if (testCaseExecution.resolvedLayers && allowedLayerPhases.includes(phase)) {
      await executeLayerPhase(phase, testCaseExecution.resolvedLayers)
    }

    await executePhase(phase, testCaseExecution.testCase)
  }

  return { execute }
}

const createTestCaseExecutor = async (
  testCaseExecution: TestCaseExecution,
  plugins: string[],
  testRunnerArgs?: unknown,
) => {
  const basePath = dirname(testCaseExecution.filePath)
  const loadedPlugins = await Promise.all(plugins.map((plugin) => import(plugin)))
  const executePluginFunction = createPluginExecutor(loadedPlugins, basePath, testRunnerArgs)
  const phaseExecutor = createPhaseExecutor(executePluginFunction, testCaseExecution)
  let errors: Error[] = []

  const execute = async (phase: TestCasePhases) => {
    try {
      if (errors.length > 0 && phase !== 'clean') {
        return
      }
      await phaseExecutor.execute(phase)
    } catch (err: any) {
      err.name = `${phase.charAt(0).toUpperCase() + phase.slice(1)}Error`
      errors.push(err)
      debug(`${err.name}: ${err.message} \n${err.stack}`)
    }
  }

  const throwIfError = () => {
    if (errors.length > 0) {
      const error = new Error(`TestCase: ${testCaseExecution.testCase.name ?? testCaseExecution.filePath} \n${errors.map((e) => `${e.name}: ${e.message}`).join(', ')}`)
      error.stack = errors.map((e) => e.stack).join('\n')
      error.name = 'TestCaseError'
      throw error
    }
  }

  return { execute, throwIfError }
}
  
export const executeTestCase = async (
  testCaseExecution: TestCaseExecution,
  plugins: string[],
  testRunnerArgs?: unknown,
) => {
  debug(`TestCase: ${JSON.stringify(testCaseExecution, null, 2)}`)
  debug(`TestRunnerArgs: ${JSON.stringify(testRunnerArgs, null, 2)}`)
  debug(`Plugins: ${JSON.stringify(plugins, null, 2)}`)

  const executor = await createTestCaseExecutor(testCaseExecution, plugins, testRunnerArgs)
  const phases: TestCasePhases[] = ['arrange', 'act', 'assert', 'clean']
  
  for (const phase of phases) {
    await executor.execute(phase)
  }

  executor.throwIfError()
}
