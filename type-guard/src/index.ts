import {is, Schema, TypeFromSchema} from 'type-assurance'

/**
 * Converts an array of types to a intersection of types
 */
export type ArrayToIntersection<T> = T extends []
  ? {}
  : T extends [infer Head, ...infer Tail]
  ? Head & ArrayToIntersection<Tail>
  : never

export function intersection<T extends Schema[]>(...schemas: T) {
  return (v: unknown): v is ArrayToIntersection<TypeFromSchema<T>> => 
    schemas.every((schema) => is(v, schema as Schema))
}
