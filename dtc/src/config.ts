import {dirname} from 'node:path'
import type {Runner, Plugins, TestCase} from './domain'
import {defaultPlugins, defaultTestRunner} from './index.js'

export type Config = {
  plugins: (basePath: string, testCase: TestCase) => Plugins
  load: (filePath: string) => TestCase
  runner: Runner
}

export const resolveConfig = async (path: string, config?: string) => {
  let testCase: TestCase
  let plugins: Plugins
  let runner: Runner = defaultTestRunner

  if (config) {
    const {plugins: customPlugins, load: customLoad, runner: customTestRunner} = (await import(`${process.cwd()}/${config}`)).default
    testCase = customLoad ? await customLoad(path) : (await import(path)).default
    plugins = customPlugins ? customPlugins(dirname(path), testCase) : defaultPlugins(dirname(path))
    runner = customTestRunner ?? defaultTestRunner
  } else {
    testCase = (await import(path)).default
    plugins = defaultPlugins(dirname(path))
  }

  return {testCase, plugins, runner}
}
