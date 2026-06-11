import {glob} from 'node:fs/promises'
import {join, dirname} from 'node:path'
import {assert} from '@cgauge/type-guard'
import {TestCaseExecution, Loader, TestCase, Layer} from './domain.js'
import {merge} from './utils.js'
import {resolveParameters} from './parameters.js'

export const isGlobPattern = (input: string): boolean => {
  return /[*?]/.test(input)
}

export const resolveGlob = async (pattern: string, cwd: string): Promise<string[]> => {
  const matches: string[] = []
  for await (const match of glob(pattern, {cwd})) {
    matches.push(match)
  }
  const sorted = matches.sort()
  return sorted
}

const generateFileList = async (pattern: string, currentPath: string): Promise<string[]> => {
  const files = await resolveGlob(pattern, currentPath)
  return files.map((f) => join(currentPath, f))
}

const loadTestCase =
  (loader: Loader) =>
  async (filePath: string, parameters?: Layer['parameters']): Promise<TestCaseExecution[]> => {
    const testCase = await loader(filePath)

    assert(testCase, TestCase)

    let resolvedTestCaseExecutions: TestCaseExecution[]

    if (parameters) {
      resolvedTestCaseExecutions = await resolveParameters({
        filePath,
        testCase: {...testCase, parameters: merge(testCase.parameters, parameters)},
      })
    } else {
      resolvedTestCaseExecutions = await resolveParameters({filePath, testCase})
    }

    const resolvedTestCaseExecutionsWithLayers = resolvedTestCaseExecutions.map(async (v) => {
      if (!v.testCase.layers?.length) {
        return v
      }

      const layersPromises = v.testCase.layers.map(async ({path, parameters}) => {
        const layers = await loadTestCase(loader)(join(dirname(v.filePath), path), parameters)
        return layers[0]
      })

      const layers = await Promise.all(layersPromises)

      const resolvedLayers = layers.map(v => v.resolvedLayers).filter((v) => !!v).flat()
      const currentLayers = layers.map(v => v.testCase as Layer)

      return { ...v, resolvedLayers: currentLayers.concat(resolvedLayers) };
    })

    return Promise.all(resolvedTestCaseExecutionsWithLayers)
  }

export const loadTestCases =
  (projectPath: string) =>
  (config: {loader: Loader; testPattern: string}) =>
  async (filePath?: string): Promise<TestCaseExecution[]> => {
    if (filePath && !isGlobPattern(filePath)) {
      return loadTestCase(config.loader)(join(projectPath, filePath))
    }

    let testFiles = await generateFileList(config.testPattern, projectPath)

    if (filePath) {
      const requestedFiles = await generateFileList(filePath, projectPath)
      testFiles = requestedFiles.filter((f) => testFiles.includes(f))
    }

    const testCaseExecutions = await Promise.all([...testFiles].map((v) => loadTestCase(config.loader)(v)))

    return testCaseExecutions.flat()
  }
