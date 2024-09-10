export interface Plugin {
  setTestRunnerArgs?: (args: unknown) => void,
  boot?: (path: string, testCase: TestCase, plugins: Plugins, type: string, config?: string) => void,
  arrange?: (args: unknown) => void,
  act?: (args: unknown) => void,
  assert?: (args: unknown) => void,
  clean?: (args: unknown) => void,
}

export type TypeTestCase = {
  arrange?: Record<string, unknown>,
  act?: Record<string, unknown>,
  assert?: unknown,
  clean?: Record<string, unknown>,
}

export type Plugins = {
  boot: Plugin[],
  [runner: string]: Plugin[],
}

type CommonTestCase = {
  name: string,
  debug: boolean,
} 

export type TestCase = CommonTestCase & {
  [runner: string]: TypeTestCase,
}
