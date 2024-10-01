export interface Plugin {
  setTestRunnerArgs?: (args: unknown) => void,
  arrange?: (args: unknown) => void,
  act?: (args: unknown) => void,
  assert?: (args: unknown) => void,
  clean?: (args: unknown) => void,
}

export type Plugins = {
  [type: string]: Plugin[],
}

export interface Runner {
  run: (path: string, testCase: TestCase, plugins: Plugins, type: string, config?: string) => Promise<void>,
}

export type TypeTestCase = {
  retry?: number
  delay?: number
  arrange?: Record<string, unknown>,
  act?: Record<string, unknown>,
  assert?: unknown,
  clean?: Record<string, unknown>,
}

type CommonTestCase = {
  name: string,
  debug?: boolean,
} 

export type TestCase = CommonTestCase & {
  [type: string]: TypeTestCase,
}
