import type {TestCaseExecution, Loader} from './domain'
import {readdir, stat} from 'node:fs/promises'
import {join} from 'path'

const generateTestCaseExecution = async (filePath: string, loader: Loader): Promise<TestCaseExecution> => ({
  filePath,
  testCase: await loader(filePath),
})

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

const replacePlaceholders = (obj: any, params: any) =>
  recursiveMap(obj, (value: string | number | boolean) => {
    if (typeof value !== 'string') {
      return value
    }

    return value.replace(/\${(.*?)}/g, (match, group) => {
      const path = group.split('.')
      let value = params
      for (const prop of path) {
        if (value && typeof value === 'object') {
          value = value[prop]
        } else {
          return match
        }
      }
      return value
    })
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
    const testCaseExecutions = await generateTestCaseExecution(filePath, loader)
    return resolveParameters(testCaseExecutions)
  }

  const files = await loadTestFiles(projectPath, testRegex)
  const testCaseExecutions = await Promise.all(files.map((file) => generateTestCaseExecution(file, loader)))

  return testCaseExecutions.map(resolveParameters).flat()
}
