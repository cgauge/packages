import {readdir, stat} from 'node:fs/promises'
import {join, dirname} from 'node:path'
import {assert} from '@cgauge/type-guard'
import {TestCaseExecution, Loader, TestCase} from './domain.js'
import {merge} from './utils.js'
import {resolveParameters} from './parameters.js'

const generateFileList = async (currentPath: string, testRegex: RegExp): Promise<string[]> => {
  const files = await readdir(currentPath)

  const recursiveLoad = files.map(async (file) => {
    const filePath = join(currentPath, file)
    const stats = await stat(filePath)
    if (stats.isDirectory()) {
      return generateFileList(filePath, testRegex)
    } else if (testRegex.test(filePath)) {
      return filePath
    }

    return null
  })

  const result = await Promise.all(recursiveLoad)

  return result.filter((v) => v !== null).flat()
}

const loadTestCase =
  (loader: Loader) =>
  async (filePath: string): Promise<TestCaseExecution[]> => {
    const testCase = await loader(filePath)

    assert(testCase, TestCase)

    const resolvedTestCaseExecutions = await resolveParameters({filePath, testCase: testCase})

    const resolvedTestCaseExecutionsWithLayers = resolvedTestCaseExecutions.map(async (v) => {
      if (!v.testCase.layers?.length) {
        return v
      }

      const layersPromises = v.testCase.layers.map(async ({path, parameters}) => {
        const layers = await loadTestCase(loader)(join(dirname(v.filePath), path))
        const layer = layers[0].testCase
        return {...layer, parameters: merge(layer.parameters, parameters)}
      })

      const layers = await Promise.all(layersPromises)

      return {...v, layers} as TestCaseExecution
    })

    return Promise.all(resolvedTestCaseExecutionsWithLayers)
  }

export const loadTestCases =
  (projectPath: string) =>
  (config: {loader: Loader; testRegex: RegExp}) =>
  async (filePath?: string): Promise<TestCaseExecution[]> => {
    if (filePath) {
      return loadTestCase(config.loader)(join(projectPath, filePath))
    }

    const files = await generateFileList(projectPath, config.testRegex)
    const testCaseExecutions = await Promise.all(files.map(loadTestCase(config.loader)))

    return testCaseExecutions.flat()
  }
