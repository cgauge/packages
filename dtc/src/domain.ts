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

export const Layer = {
  retry: optional(Number),
  delay: optional(Number),
  parameters: optional(record(String, unknown)),
  arrange: optional(UnionRecordRecordArray),
  // assert: optional(union(String, intersection({exception: optional({name: String})}, UnionRecordRecordArray))),
  clean: optional(UnionRecordRecordArray),
}
export type Layer = TypeFromSchema<typeof Layer>

export const TestCase = intersection(GenericAttributes, {
  name: String,
  debug: optional(Boolean),
  retry: optional(Number),
  delay: optional(Number),
  timeout: optional(Number),
  layers: optional([String]),
  parameters: optional(UnionRecordRecordArray),
  arrange: optional(UnionRecordRecordArray),
  act: optional(record(String, unknown)),
  assert: optional(union(String, intersection({exception: optional({name: String})}, UnionRecordRecordArray))),
  clean: optional(UnionRecordRecordArray),
})
export type TestCase = TypeFromSchema<typeof TestCase>

export const TestCaseExecution = {
  filePath: String,
  testCase: TestCase,
  layers: optional([Layer])
}
export type TestCaseExecution = {
  filePath: string,
  testCase: TestCase,
  layers?: Layer[]
}
