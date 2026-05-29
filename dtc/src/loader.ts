import {glob} from 'node:fs/promises'
import {join, dirname} from 'node:path'
import {assert} from '@cgauge/type-guard'
import {TestCaseExecution, Loader, TestCase, Layer} from './domain.js'
import {merge} from './utils.js'
import {resolveParameters} from './parameters.js'

/**
 * Determines whether a string contains glob wildcard characters.
 */
export const isGlobPattern = (input: string): boolean => {
  return /[*?]/.test(input)
}

/**
 * Expands a glob pattern relative to the given base directory.
 * Returns a sorted list of relative file paths (files only).
 */
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
    if (filePath && isGlobPattern(filePath)) {
      const resolvedFiles = await resolveGlob(filePath, projectPath)
      const testCaseExecutions = await Promise.all(resolvedFiles.map((v) => loadTestCase(config.loader)(join(projectPath, v))))

      return testCaseExecutions.flat()
    }

    if (filePath) {
      return loadTestCase(config.loader)(join(projectPath, filePath))
    }

    const files = await generateFileList(config.testPattern, projectPath)
    const testCaseExecutions = await Promise.all(files.map((v) => loadTestCase(config.loader)(v)))

    return testCaseExecutions.flat()
  }
