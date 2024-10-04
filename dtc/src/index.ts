import type {TypeTestCase, Plugin, Plugins} from './domain'
import {DisableNetConnectPlugin} from './plugins/DisableNetConnectPlugin.js'
import {FunctionCallPlugin} from './plugins/FunctionCallPlugin.js'
import {HttpCallPlugin} from './plugins/HttpCallPlugin.js'
import {HttpMockPlugin} from './plugins/HttpMockPlugin.js'
import {NodeTestRunner} from './runners/NodeTestRunner.js'
import {retry} from './utils.js'
import {dirname} from 'node:path'

export type * from './domain'
export * from './utils.js'
export * from './config.js'

export {DisableNetConnectPlugin, FunctionCallPlugin, HttpCallPlugin, HttpMockPlugin, NodeTestRunner}

export const defaultTestRunner = new NodeTestRunner()

export const defaultLoader = async (filePath: string) => (await import(filePath)).default

export const defaultPlugins: Plugins = {
  unit: [new DisableNetConnectPlugin(), new FunctionCallPlugin()],
  narrow: [new DisableNetConnectPlugin(), new FunctionCallPlugin(), new HttpMockPlugin()],
  broad: [new FunctionCallPlugin(), new HttpCallPlugin()],
}

export const executeTestCase = async (
  testCase: TypeTestCase,
  plugins: Plugin[],
  filePath: string,
  testRunnerArgs?: unknown,
) => {
  plugins.forEach((plugin) => {
    plugin.setTestRunnerArgs?.(testRunnerArgs)
    plugin.setBasePath?.(dirname(filePath))
  })

  await Promise.all(plugins.map((plugin) => plugin.arrange?.(testCase.arrange)))
  await Promise.all(plugins.map((plugin) => plugin.act?.(testCase.act)))
  await Promise.all(
    plugins.map((plugin) =>
      retry(async () => plugin.assert?.(testCase.assert), testCase.retry ?? 0, testCase.delay ?? 0),
    ),
  )
  await Promise.all(plugins.map((plugin) => plugin.clean?.(testCase.clean)))
}
