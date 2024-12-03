import {TestCaseExecution, Loader, TestCase} from './domain.js'
import {readdir, stat} from 'node:fs/promises'
import {join} from 'path'
import {assert} from '@cgauge/type-guard'

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

const resolveParameters = (testCaseExecution: TestCaseExecution): TestCaseExecution[] => {
  if (testCaseExecution.testCase.parameters) {
    const params = testCaseExecution.testCase.parameters

    if (Array.isArray(params)) {
      return params.map((param, i) => {
        const resolvedParams = replacePlaceholders(param, param)

        return {
          filePath: testCaseExecution.filePath,
          testCase: {
            ...replacePlaceholders(testCaseExecution.testCase, resolvedParams),
            name: `${testCaseExecution.testCase.name} (provider ${i})`,
          },
        }
      })
    }

    const resolvedParams = replacePlaceholders(params, params)

    return [
      {
        filePath: testCaseExecution.filePath,
        testCase: replacePlaceholders(testCaseExecution.testCase, resolvedParams),
      },
    ]
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
    return resolveParameters(testCaseExecutions)
  }

  const files = await loadTestFiles(projectPath, testRegex)
  const testCaseExecutions = await Promise.all(files.map((file) => generateTestCaseExecution(file, loader)))

  return testCaseExecutions.map(resolveParameters).flat()
}
