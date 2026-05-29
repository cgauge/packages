import type {Runner, Loader, Plugin} from './domain'
import {defaultLoader, defaultPlugins, defaultTestRunner} from './index.js'

export type Config = {
  plugins: Plugin[]
  loader: Loader
  runner: Runner
  testPattern: string
}

export const resolveConfig = async (configPath?: string): Promise<Config> => {
  let runner: Runner = defaultTestRunner
  let plugins = defaultPlugins
  let loader = defaultLoader
  let testPattern = '**/*.dtc.{ts,js}'

  if (configPath) {
    const {
      plugins: customPlugins,
      loader: customLoad,
      runner: customTestRunner,
      testPattern: customTestPattern,
    } = await defaultLoader(`${process.cwd()}/${configPath}`)

    runner = customTestRunner ?? defaultTestRunner
    loader = customLoad ?? loader
    plugins = customPlugins ? customPlugins : defaultPlugins
    testPattern = customTestPattern ?? testPattern
  }

  return {loader, plugins, runner, testPattern}
}

