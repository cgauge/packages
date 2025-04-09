import type {TestCaseExecution} from './domain.js'

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

export const resolveParameters = async (testCaseExecution: TestCaseExecution): Promise<TestCaseExecution[]> => {
  if (!testCaseExecution.testCase.parameters) {
    return [testCaseExecution]
  }

  const params = testCaseExecution.testCase.parameters

  //Data Provider
  if (Array.isArray(params)) {
    return params.map((param, i) => {
      return {
        testCase: {
          ...replacePlaceholders(testCaseExecution.testCase, replacePlaceholders(param, param)),
          name: `${testCaseExecution.testCase.name ?? testCaseExecution.filePath} (provider ${i})`,
        },
        filePath: testCaseExecution.filePath,
      }
    })
  }

  return [
    {
      testCase: replacePlaceholders(testCaseExecution.testCase, replacePlaceholders(params, params)),
      filePath: testCaseExecution.filePath,
    },
  ]
}
