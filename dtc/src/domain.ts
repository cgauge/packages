import {intersection} from '@cgauge/type-guard'
import {optional, record, TypeFromSchema, union, unknown} from 'type-assurance'

export type Loader = (filePath: string) => Promise<TestCase>

export type Runner = (
  testCases: TestCaseExecution[],
  plugins: string[],
  args?: string[],
  config?: string,
) => Promise<void>

const GenericAttributes = record(
  String,
  union(String, Number, Boolean, record(String, unknown), [record(String, unknown)]),
)
type GenericAttributes = TypeFromSchema<typeof GenericAttributes>

export const TestCase = intersection(GenericAttributes, {
  name: String,
  debug: optional(Boolean),
  retry: optional(Number),
  delay: optional(Number),
  timeout: optional(Number),
  parameters: optional(union(record(String, unknown), [record(String, unknown)])),
  arrange: optional(record(String, unknown)),
  act: optional(record(String, unknown)),
  assert: optional(union(String, intersection({exception: optional({name: String})}, record(String, unknown)))),
  clean: optional(record(String, unknown)),
})
export type TestCase = TypeFromSchema<typeof TestCase>

export const TestCaseExecution = {
  filePath: String,
  testCase: TestCase,
}
export type TestCaseExecution = {
  filePath: string,
  testCase: TestCase,
}
