import nodeAssert from 'node:assert'
import {equals, getObjectKeys, iterableEquality, subsetEquality} from '@jest/expect-utils'

interface ExtraAssertions {
  objectContains<T extends Record<string | symbol, unknown>>(
    actual: Record<string | symbol, unknown>,
    expected: T,
    message?: string | Error,
  ): asserts actual is Partial<T>
}

const assertions: ExtraAssertions = {
  objectContains<T extends Record<string | symbol, unknown>>(
    actual: Record<string | symbol, unknown>,
    expected: T,
    message?: string | Error,
  ): asserts actual is Partial<T> {
    const actualKeys = getObjectKeys(actual)
    const expectedKeys = getObjectKeys(expected)

    for (const key of expectedKeys) {
      if (!actualKeys.includes(key) || !equals(actual[key], expected[key], [iterableEquality, subsetEquality])) {
        nodeAssert.deepEqual(
          actual,
          expected,
          message ??
            `Invalid key [${key.toString()}]\n
${JSON.stringify(actual, undefined, 2)}\n
${JSON.stringify(expected, undefined, 2)}`,
        )
      }
    }
  },
}

export default assertions
