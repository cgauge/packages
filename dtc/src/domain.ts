import {intersection, optional, record, TypeFromSchema, union, unknown} from '@cgauge/type-guard'

export type Loader = <T = TestCase>(filePath: string) => Promise<T>

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

const UnionRecordRecordArray = union(record(String, unknown), [record(String, unknown)])

export const TestCaseLayer = {
  path: String,
  parameters: optional(record(String, unknown)),
}
export type TestCaseLayer = TypeFromSchema<typeof TestCaseLayer>

export const TestCase = intersection(GenericAttributes, {
  name: optional(String),
  debug: optional(Boolean),
  retry: optional(Number),
  delay: optional(Number),
  timeout: optional(Number),
  layers: optional([TestCaseLayer]),
  parameters: optional(UnionRecordRecordArray),
  arrange: optional(UnionRecordRecordArray),
  act: optional(record(String, unknown)),
  assert: optional(union(String, intersection({exception: optional({name: String})}, UnionRecordRecordArray))),
  clean: optional(UnionRecordRecordArray),
})
export type TestCase = TypeFromSchema<typeof TestCase>

export const Layer = {
  retry: optional(Number),
  delay: optional(Number),
  parameters: optional(record(String, unknown)),
  arrange: optional(UnionRecordRecordArray),
  clean: optional(UnionRecordRecordArray),
}
export type Layer = TypeFromSchema<typeof Layer>

export const TestCaseExecution = {
  filePath: String,
  testCase: TestCase,
  resolvedLayers: optional([Layer])
}
export type TestCaseExecution = {
  filePath: string,
  testCase: TestCase,
  resolvedLayers?: Layer[]
}
