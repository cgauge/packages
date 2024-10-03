import type {Runner, Plugins, TestCase} from './domain'
import {defaultPlugins, defaultTestRunner} from './index.js'
import {readdirSync, statSync} from 'fs'
import {join} from 'path'

export type Config = {
  plugins: Plugins
  loader: (filePath: string) => TestCase
  runner: Runner
  testDir: string
  testRegex: string
}

export const resolveConfig = async (fileNamePath: string | null, config?: string) => {
  const projectPath = process.cwd()
  let runner: Runner = defaultTestRunner
  let loader: ((filePath: string) => TestCase) | null = null
  let testRegex = /.*\.dtc\.[jt]s?$/
  let plugins = defaultPlugins

  if (config) {
    const {
      plugins: customPlugins,
      loader: customLoad,
      runner: customTestRunner,
      testRegex: customTestRegex,
    } = (await import(`${process.cwd()}/${config}`)).default

    runner = customTestRunner ?? defaultTestRunner
    testRegex = customTestRegex ?? testRegex
    loader = customLoad ?? loader
    plugins = customPlugins ? customPlugins : defaultPlugins
  }

  const testCases = await getTestCases(projectPath, fileNamePath, loader, testRegex)
  return {testCases, plugins, runner}
}

const getTestCases = async (
  projectPath: string,
  fileNamePath: string | null,
  loader: ((filePath: string) => TestCase) | null,
  testRegex: RegExp,
): Promise<TestCase[]> => {
  if (fileNamePath) {
    fileNamePath = `${projectPath}/${fileNamePath}`
    const testCase = loader ? await loader(fileNamePath) : (await import(fileNamePath)).default
    
    return [
      {
        ...testCase,
        fileName: fileNamePath,
      },
    ]
  }

  const files = loadTestFiles(projectPath, testRegex)
  return await Promise.all(
    files.map(async (file) => {
      const testCase = loader ? await loader(file) : (await import(file)).default

      return {
        ...testCase,
        fileName: file,
      }
    }),
  )
}

export const loadTestFiles = (dir: string, testRegex: RegExp, fileList: string[] = []): string[] => {
  readdirSync(dir).forEach((file) => {
    const filePath = join(dir, file)

    if (statSync(filePath).isDirectory()) {
      loadTestFiles(filePath, testRegex, fileList)
    } else if (testRegex.test(filePath)) {
      fileList.push(filePath)
    }
  })

  return fileList
}
