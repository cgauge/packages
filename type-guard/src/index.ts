import {diff, optional, unknown, Schema, assert} from 'type-assurance'

/**
 * Marker for optional properties.
 */
const OPTIONAL = 'type-assurance:optional' as const

/**
 * Type to get the actual type from a schema.
 */
export type TypeFromSchema<T> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : T extends ReadonlyArray<Schema>
  ? {[P in keyof T]: TypeFromSchema<T[P]>}
  : T extends {[key: string]: Schema}
  ? Expand<OptionalProps<T> & RequiredProps<T>>
  : T extends new (...args: any) => infer R
  ? R
  : T extends (v: unknown) => v is infer R
  ? R
  : T

type Expand<T> = T extends unknown ? {[K in keyof T]: T[K]} : never

/**
 * Extract only the optional props of a schema.
 */
type OptionalProps<T> = {
  -readonly [K in keyof T as T[K] extends {[OPTIONAL]: true} ? K : never]?: TypeFromSchema<T[K]>
}

/**
 * Extract only the required props of a schema.
 */
type RequiredProps<T> = {
  -readonly [K in keyof T as T[K] extends {[OPTIONAL]: true} ? never : K]: TypeFromSchema<T[K]>
}

/**
 * Type guard to check if a value is compatible with a given schema.
 */
export function is<const T extends Schema>(value: unknown, schema: T): value is TypeFromSchema<T> {
  return diff(value, schema).length === 0
}

/**
 * Creates a type guard that checks if a value matches any of the given schemas.
 */
export function union<T extends Schema[]>(...schemas: T) {
  return (v: unknown): v is TypeFromSchema<T[number]> => schemas.some((schema) => is(v, schema))
}

/**
 *  Valid Record keys
 */
export type RecordKeys = StringConstructor | NumberConstructor | string | number

/**
 * Creates a type guard that checks if a value matches a given Record<K, V>.
 */
export function record<const K extends RecordKeys, const V extends Schema>(key: K, value: V) {
  return (v: unknown): v is Record<TypeFromSchema<K>, TypeFromSchema<V>> =>
    typeof v === 'object' &&
    v !== null &&
    Object.values(v).every((y) => is(y, value)) &&
    Object.keys(v).every((y) => is(y, key))
}

/**
 * Converts an array of types to a intersection of types
 */
export type ArrayToIntersection<T> = T extends []
  ? {}
  : T extends [infer Head, ...infer Tail]
  ? Head & ArrayToIntersection<Tail>
  : never

export function intersection<T extends Schema[]>(...schemas: T) {
  return (v: unknown): v is ArrayToIntersection<TypeFromSchema<T>> => schemas.every((schema) => is(v, schema as Schema))
}

export {diff, optional, unknown, assert}
