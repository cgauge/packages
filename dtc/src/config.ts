import type {Runner, Loader, TestCaseExecution} from './domain'
import {defaultLoader, defaultPlugins, defaultTestRunner} from './index.js'
import {readdirSync, statSync} from 'fs'
import {join} from 'path'

export type Config = {
  plugins: string[]
  loader: Loader
  runner: Runner
  testDir: string
  testRegex: string
}

export const resolveConfig = async (filePath?: string, configPath?: string) => {
  const projectPath = process.cwd()
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

  const testCaseExecutions = await getTestCases(projectPath, loader, testRegex, filePath)

  return {testCaseExecutions, plugins, runner}
}

const generateTestCaseExecution = async (filePath: string, loader: Config['loader']): Promise<TestCaseExecution> => ({
  filePath,
  testCase: await loader(filePath),
})

const getTestCases = async (
  projectPath: string,
  loader: Config['loader'] | null,
  testRegex: RegExp,
  filePath?: string,
): Promise<TestCaseExecution[]> => {
  if (filePath) {
    return loader
      ? [await generateTestCaseExecution(filePath, loader)]
      : [await generateTestCaseExecution(filePath, defaultLoader)]
  }

  const files = loadTestFiles(projectPath, testRegex)

  return await Promise.all(
    files.map((file) =>
      loader ? generateTestCaseExecution(file, loader) : generateTestCaseExecution(file, defaultLoader),
    ),
  )
}

export const loadTestFiles = (currentPath: string, testRegex: RegExp): string[] =>
  readdirSync(currentPath)
    .map((file) => {
      const filePath = join(currentPath, file)

      if (statSync(filePath).isDirectory()) {
        return loadTestFiles(filePath, testRegex)
      } else if (testRegex.test(filePath)) {
        return filePath
      }

      return null
    })
    .filter((item) => item !== null)
    .flat()
