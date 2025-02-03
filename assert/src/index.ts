import nodeAssert from 'node:assert'

const debug = (...message: any) => { process.env.ASSERT_DEBUG && console.log(...message) }

interface ExtraAssertions {
  objectContains<T extends Record<string, any>>(
    actual: Record<string, any>,
    expected: T,
    message?: string | Error,
  ): asserts actual is Partial<T>
}

const formatValues = <A, E>(actual: A, expected: E) => `\n\nActual:
${JSON.stringify(actual, undefined, 2)}\n
Expected:
${JSON.stringify(expected, undefined, 2)}\n`

const assertions: ExtraAssertions = {
  objectContains<T extends Record<string, any>>(
    actual: Record<string, any>,
    expected: T,
    message?: string | Error,
  ): asserts actual is Partial<T> {
    debug('[ASSERT] objectContains', actual, expected)

    if (typeof actual !== 'object' || typeof expected !== 'object') {
      throw new Error(`Both actual and expected values must be objects. ${formatValues(actual, expected)}`);
    }

    if (Array.isArray(actual) && Array.isArray(expected) && actual.length !== expected.length) {
      throw new Error(`Both actual and expected should have the same number of elements. ${formatValues(actual, expected)}`);
    }
  
    const expectedKeys = Object.keys(expected);
    
    for (const key of expectedKeys) {
      if (key in actual) {
        if (typeof actual[key] !== typeof expected[key]) {
          throw new Error(`Type mismatch for key '${String(key)}'. Expected ${typeof expected[key]} but got ${typeof actual[key]}. ${message ?? ''}`);
        }
    
        if (typeof expected[key] === 'object' && expected[key] !== null) {
          try {
            assertions.objectContains(actual[key], expected[key], message);
          } catch (e: any) {
            throw new Error(`Error asserting key '${String(key)}': ${e.message}`);
          }
        } else if (actual[key] !== expected[key]) {
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
    }
  },
}

export default assertions
