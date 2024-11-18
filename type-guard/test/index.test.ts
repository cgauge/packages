import {test} from 'node:test'
import nodeAssert from 'node:assert'
import {ArrayToIntersection, intersection} from '../src/index'
import {is, record, TypeFromSchema, union} from 'type-assurance'

test('intersection', () => {
  const a: unknown = {foo: 'bar', baz: 42}
  nodeAssert.ok(is(a, intersection({foo: String}, {baz: Number})))
  nodeAssert.ok(!is(a, {foo: intersection({foo: Boolean}, {baz: Number})}))
})

test('intersection type resolution', () => {
  const hasFooAndBaz = intersection({foo: String}, {baz: Number})
  let x: TypeFromSchema<typeof hasFooAndBaz>
  x = {foo: 'bar', baz: 42}

  //@ts-expect-error
  x = {foo: 'bar'}
})
