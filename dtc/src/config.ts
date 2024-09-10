import {dirname} from 'node:path'
import type {Plugins, TestCase} from './domain'
import {defaultPlugins} from './index.js'

export const resolveConfig = async (path: string, config?: string) => {
  let testCase: TestCase
  let plugins: Plugins

  if (config) {
    const {plugins: customPlugins, load: customLoad} = (await import(`${process.cwd()}/${config}`)).default
    testCase = customLoad ? await customLoad(path) : (await import(path)).default
    plugins = customPlugins ? customPlugins(dirname(path), testCase) : defaultPlugins(dirname(path))
  } else {
    testCase = (await import(path)).default
    plugins = defaultPlugins(dirname(path))
  }

  return {testCase, plugins}
}
