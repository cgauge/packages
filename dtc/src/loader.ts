import {TestCaseExecution, Loader, TestCase, Layer} from './domain.js'
import {readdir, stat} from 'node:fs/promises'
import {join, dirname} from 'path'
import {assert} from '@cgauge/type-guard'
import {merge} from './utils.js'

const generateTestCaseExecution = async (filePath: string, loader: Loader): Promise<TestCaseExecution> => {
  const testCase = await loader(filePath)
  assert(testCase, TestCase)
  return {filePath, testCase: testCase}
}

const loadTestFiles = async (currentPath: string, testRegex: RegExp): Promise<string[]> => {
  const files = await readdir(currentPath)

  const recursiveLoad = files.map(async (file) => {
    const filePath = join(currentPath, file)
    const stats = await stat(filePath)
    if (stats.isDirectory()) {
      return loadTestFiles(filePath, testRegex)
    } else if (testRegex.test(filePath)) {
      return filePath
    }

    return null
  })

  const result = await Promise.all(recursiveLoad)

  return result.filter((item) => item !== null).flat()
}

const recursiveMap = (obj: any, callback: (v: any) => any): any => {
  if (Array.isArray(obj)) {
    return obj.map((element) => recursiveMap(element, callback))
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = recursiveMap(obj[key], callback)
      return acc
    }, {} as Record<string, unknown>)
  }

  return callback(obj)
}

const getValueByPath = (path: string, params: Record<string, unknown>): unknown => {
  const attributes = path.split('.')
  let resolvedValue: unknown = params

  for (const attribute of attributes) {
    if (resolvedValue && typeof resolvedValue === 'object') {
      resolvedValue = (resolvedValue as Record<string, unknown>)[attribute]
    } else {
      throw new Error(`Invalid parameter property: ${attribute} (${path}).`)
    }
  }

  return resolvedValue
}

const replacePlaceholders = (template: unknown, params: Record<string, unknown>) =>
  recursiveMap(template, (value: string | number | boolean) => {
    if (typeof value !== 'string') {
      return value
    }

    const regex = new RegExp(/\${(.*?)}/g)
    const matches = regex.exec(value)

    if (matches !== null) {
      if (matches[0] !== matches.input) {
        return value.replace(regex, (_, path) => getValueByPath(path, params) as string)
      }

      return getValueByPath(matches[1], params)
    }

    return value
  })

const resolveTestCaseExecutionParams = (testCaseExecution: TestCaseExecution, param: Record<string, unknown>, loadedLayers: Layer[], name: string) => {
  if (loadedLayers) {
    loadedLayers
      .filter((v) => v.parameters)
      .forEach((v) => {
        param = merge(v.parameters, param)
      })
  }

  const resolvedParams = replacePlaceholders(param, param)

  return {
    filePath: testCaseExecution.filePath,
    testCase: {
      ...replacePlaceholders(testCaseExecution.testCase, resolvedParams),
      name,
    },
    layers: loadedLayers,
  }
}

const resolveParameters =
  (loader: Loader) =>
  async (testCaseExecution: TestCaseExecution): Promise<TestCaseExecution[]> => {
    let loadedLayers: Layer[] = []

    if (testCaseExecution.testCase.layers) {
      const testCaseExecutionFilePath = dirname(testCaseExecution.filePath)
      const layersPromises = testCaseExecution.testCase.layers.map((filePath) =>
        loader<Layer>(testCaseExecutionFilePath + '/' + filePath),
      )
      loadedLayers = await Promise.all(layersPromises)
    }

    if (testCaseExecution.testCase.parameters) {
      let params = testCaseExecution.testCase.parameters

      if (Array.isArray(params)) { //Data Provider
        return params.map((param, i) => {
          return resolveTestCaseExecutionParams(testCaseExecution, param, loadedLayers, `${testCaseExecution.testCase.name} (provider ${i})`)
        })
      }

      return [resolveTestCaseExecutionParams(testCaseExecution, params, loadedLayers, testCaseExecution.testCase.name)]
    }

    return [testCaseExecution]
  }

export const loadTestCases = async (
  projectPath: string,
  loader: Loader,
  testRegex: RegExp,
  filePath?: string,
): Promise<TestCaseExecution[]> => {
  if (filePath) {
    const testCaseExecutions = await generateTestCaseExecution(projectPath + '/' + filePath, loader)
    return resolveParameters(loader)(testCaseExecutions)
  }

  const files = await loadTestFiles(projectPath, testRegex)
  const testCaseExecutions = await Promise.all(files.map((file) => generateTestCaseExecution(file, loader)))

  return (await Promise.all(testCaseExecutions.map(resolveParameters(loader)))).flat()
}
