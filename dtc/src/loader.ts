import {TestCaseExecution, Loader, TestCase} from './domain.js'
import {readdir, stat} from 'node:fs/promises'
import {join, dirname} from 'node:path'
import {assert} from '@cgauge/type-guard'
import {merge} from './utils.js'

const generateTestCaseExecution = async (filePath: string, loader: Loader): Promise<TestCaseExecution> => {
  const testCase = await loader<TestCase>(filePath)
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

const replacePlaceholders = <T>(template: T, params: Record<string, unknown>): T =>
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

const resolveTestCaseParams = <T>(testCase: T, param: Record<string, unknown>): T => {
  const resolvedParams = replacePlaceholders(param, param)
  return replacePlaceholders(testCase, resolvedParams)
}

const resolveParameters =
  async (testCaseExecution: TestCaseExecution): Promise<TestCaseExecution[]> => {
    if (! testCaseExecution.testCase.parameters) {
      return [testCaseExecution]
    }

    const params = testCaseExecution.testCase.parameters

    //Data Provider
    if (Array.isArray(params)) {
      return params.map((param, i) => {
        return {
          testCase: {
            ...resolveTestCaseParams(testCaseExecution.testCase, param),
            name: `${testCaseExecution.testCase.name ?? testCaseExecution.filePath} (provider ${i})`,
          },
          filePath: testCaseExecution.filePath,
        }
      })
    }

    return [{
      testCase: resolveTestCaseParams(testCaseExecution.testCase, params),
      filePath: testCaseExecution.filePath,
    }]
  }

type Config = {
  loader: Loader
  testRegex: RegExp
}

const loadTestCase = (config: Config) => async (filePath: string): Promise<TestCaseExecution[]> => {
  const testCaseExecution = await generateTestCaseExecution(filePath, config.loader)
  const resolvedTestCaseExecutions = await resolveParameters(testCaseExecution)

  const resolvedTestCaseExecutionsWithLayers = resolvedTestCaseExecutions
    .map(async (v) => {
      if (! v.testCase.layers?.length) {
        return v
      }

      const layersPromises = v.testCase.layers.map(async ({path, parameters}) => {
        const layers = await loadTestCase(config)(dirname(v.filePath) + '/' + path)
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
  (config: Config) =>
  async (filePath?: string): Promise<TestCaseExecution[]> => {
    if (filePath) {
      return loadTestCase(config)(projectPath + '/' + filePath)
    }

    const files = await loadTestFiles(projectPath, config.testRegex)
    const testCaseExecutions = await Promise.all(files.map(loadTestCase(config)))

    return testCaseExecutions.flat()
  }
