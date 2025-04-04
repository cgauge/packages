import nodeAssert from 'node:assert'

const debug = (...message: any) => {
  process.env.ASSERT_DEBUG && console.log(...message)
}

interface ExtraAssertions {
  objectContains<T extends Record<string, any>>(
    actual: Record<string, any>,
    expected: T,
    message?: string | Error,
  ): asserts actual is Partial<T>
}

const isObject = (v: unknown) => typeof v === 'object' && v !== null

const assertions: ExtraAssertions = {
  objectContains<T extends Record<string, any>>(
    actual: Record<string, any>,
    expected: T,
    message?: string | Error,
  ): asserts actual is Partial<T> {
    debug('[ASSERT] objectContains', actual, expected)

    if (typeof actual !== 'object' || typeof expected !== 'object') {
      nodeAssert.deepEqual(actual, expected, `${message ?? ''}Both actual and expected values must be objects`)
    }

    if (Array.isArray(actual) && Array.isArray(expected) && actual.length !== expected.length) {
      nodeAssert.deepEqual(
        actual,
        expected,
        `${message ?? ''}Both actual and expected should have the same number of elements`,
      )
    }

    const expectedKeys = Object.keys(expected)

    for (const key of expectedKeys) {
      if (key in actual) {
        if (isObject(expected[key]) && isObject(actual[key])) {
          assertions.objectContains(actual[key], expected[key], message)
        } else if (actual[key] !== expected[key]) {
          nodeAssert.deepEqual(actual, expected, `${message ?? ''}Invalid key [${key.toString()}]`)
        }
      }
    }
  },
}

export default assertions
