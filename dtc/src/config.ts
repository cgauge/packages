import type {Runner, Loader} from './domain'
import {defaultLoader, defaultPlugins, defaultTestRunner} from './index.js'

export type Config = {
  plugins: string[]
  loader: Loader
  runner: Runner
  testRegex: string
}

export const resolveConfig = async (configPath?: string) => {
  let runner: Runner = defaultTestRunner
  let plugins = defaultPlugins
  let loader = defaultLoader
  let testRegex = /.*\.dtc\.[jt]s?$/

  if (configPath) {
    const {
      plugins: customPlugins,
      loader: customLoad,
      runner: customTestRunner,
      testRegex: customTestRegex,
    } = await defaultLoader(`${process.cwd()}/${configPath}`)

    runner = customTestRunner ?? defaultTestRunner
    loader = customLoad ?? loader
    plugins = customPlugins ? customPlugins : defaultPlugins
    testRegex = customTestRegex ?? testRegex
  }

  return {loader, plugins, runner, testRegex}
}

