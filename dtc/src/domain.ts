export type Loader = (filePath: string) => Promise<TestCase>

export type Runner = (testCases: TestCaseExecution[], plugins: string[], config?: string) => Promise<void>

export type TestCase = {
  name: string
  debug?: boolean
  retry?: number
  delay?: number
  arrange?: Record<string, unknown>
  act?: Record<string, unknown>
  assert?: unknown
  clean?: Record<string, unknown>
}

export type TestCaseExecution = {
  filePath: string
  testCase: TestCase
}
