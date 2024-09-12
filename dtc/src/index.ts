import type {TypeTestCase, Plugin, Plugins} from './domain'
import {DisableNetConnectPlugin} from './plugins/DisableNetConnectPlugin.js'
import {FunctionCallPlugin} from './plugins/FunctionCallPlugin.js'
import {HttpCallPlugin} from './plugins/HttpCallPlugin.js'
import {HttpMockPlugin} from './plugins/HttpMockPlugin.js'
import {NodeTestRunnerPlugin} from './plugins/NodeTestRunnerPlugin.js'
import { retry } from './utils.js'

export type * from './domain'
export * from './utils.js'
export * from './config.js'

export {DisableNetConnectPlugin, FunctionCallPlugin, HttpCallPlugin, HttpMockPlugin, NodeTestRunnerPlugin}

export const defaultPlugins = (basePath: string): Plugins => ({
  boot: [new NodeTestRunnerPlugin()],
  unit: [new DisableNetConnectPlugin(), new FunctionCallPlugin(basePath)],
  narrow: [new DisableNetConnectPlugin(), new FunctionCallPlugin(basePath), new HttpMockPlugin()],
  broad: [new FunctionCallPlugin(basePath), new HttpCallPlugin()],
})

export const executeTestCase = async (testCase: TypeTestCase, plugins: Plugin[], testRunnerArgs: unknown) => {
  plugins.forEach((plugin) => plugin.setTestRunnerArgs?.(testRunnerArgs))

  await Promise.all(plugins.map((plugin) => plugin.arrange?.(testCase.arrange)))
  await Promise.all(plugins.map((plugin) => plugin.act?.(testCase.act)))
  await Promise.all(plugins.map((plugin) => {
    retry(async () => plugin.assert?.(testCase.assert), testCase.retry ?? 0, testCase.delay ?? 0)
  }))
  await Promise.all(plugins.map((plugin) => plugin.clean?.(testCase.clean)))
}
