import nodeAssert from 'node:assert'

interface ExtraAssertions {
  objectContains<T extends Record<string, any>>(
    actual: Record<string, any>,
    expected: T,
    message?: string | Error,
  ): asserts actual is Partial<T>
}

const assertions: ExtraAssertions = {
  objectContains<T extends Record<string, any>>(
    actual: Record<string, any>,
    expected: T,
    message?: string | Error,
  ): asserts actual is Partial<T> {
    if (typeof actual !== 'object' || typeof expected !== 'object') {
      throw new Error('Both actual and expected values must be objects');
    }
  
    const expectedKeys = Object.keys(expected);
    
    for (const key of expectedKeys) {
      if (key in actual) {
        if (typeof actual[key] !== typeof expected[key]) {
          throw new Error(`Type mismatch for key '${String(key)}'. Expected ${typeof expected[key]} but got ${typeof actual[key]}. ${message}`);
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
