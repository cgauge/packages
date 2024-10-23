export type Loader = (filePath: string) => Promise<TestCase>

export type Runner = (testCases: TestCaseExecution[], plugins: string[], config?: string) => Promise<void>

export type GenericAttributes = {
  [key: string]: string | number | boolean | Record<string, unknown> | Record<string, unknown>[]
}

export type TestCase = GenericAttributes & {
  name: string
  debug?: boolean
  retry?: number
  delay?: number
  parameters?: Record<string, unknown> | Record<string, unknown>[]
  arrange?: Record<string, unknown>
  act?: Record<string, unknown>
  assert?: unknown
  clean?: Record<string, unknown>
}

export type TestCaseExecution = {
  filePath: string
  testCase: TestCase
}
