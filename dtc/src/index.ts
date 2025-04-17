import type {TestCase, TestCaseExecution, StepName} from './domain'
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

const createStepExecutor = (
  executePluginFunction: (functionName: string, data: unknown) => Promise<void>,
  testCaseExecution: TestCaseExecution,
) => {
  const executeStep = async (stepName: StepName, testCase: TestCase) => {
    if (!testCase[stepName]) {
      return
    }

    if (stepName === 'assert') {  
      await retry(() => executePluginFunction(stepName, testCase[stepName]), testCase.retry, testCase.delay)
    } else {
      await executePluginFunction(stepName, testCase[stepName])
    }
  }

  const executeLayerStep = async (stepName: StepName, layers: TestCase[]) => {
    await Promise.all(
      layers
        .filter((layer) => layer[stepName])
        .map((layer) => executeStep(stepName, layer))
    )
  }

  const execute = async (stepName: StepName) => {
    if (testCaseExecution.resolvedLayers) {
      await executeLayerStep(stepName, testCaseExecution.resolvedLayers)
    }

    await executeStep(stepName, testCaseExecution.testCase)
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
  const stepExecutor = createStepExecutor(executePluginFunction, testCaseExecution)
  let errors: Error[] = []

  const execute = async (stepName: StepName) => {
    try {
      if (errors.length > 0 && stepName !== 'clean') {
        return
      }
      await stepExecutor.execute(stepName)
    } catch (err: any) {
      err.name = `${stepName.charAt(0).toUpperCase() + stepName.slice(1)}Error`
      errors.push(err)
      debug(`${err.name}: ${err.message} \n${err.stack}`)
    }
  }

  const validateExecution = () => {
    if (errors.length > 0) {
      const error = new Error(`TestCase: ${testCaseExecution.testCase.name ?? testCaseExecution.filePath} \n${errors.map((e) => `${e.name}: ${e.message}`).join(', ')}`)
      error.stack = errors.map((e) => e.stack).join('\n')
      error.name = 'TestCaseError'
      throw error
    }
  }

  return { execute, validateExecution }
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
  const steps: StepName[] = ['arrange', 'act', 'assert', 'clean']
  
  for (const step of steps) {
    await executor.execute(step)
  }

  executor.validateExecution()
}
