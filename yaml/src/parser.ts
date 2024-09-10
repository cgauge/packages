import {Type, load as jsYamlLoad, DEFAULT_SCHEMA, LoadOptions, Schema} from 'js-yaml'
import {dirname} from 'node:path'
import {URLSearchParams} from 'node:url'
import {readFileSync} from 'node:fs'

const jsType = new Type('!js', {
  kind: 'scalar',
  resolve: (data) => typeof data === 'string',
  construct: (data) => eval(data),
})

const includeType = (basePath: string) =>
  new Type('!include', {
    kind: 'scalar',
    resolve: (data) => typeof data === 'string',
    construct: (data) => load(basePath + '/' + data, {schema: schema(basePath)}),
  })

const contentType = (basePath: string) =>
  new Type('!content', {
    kind: 'scalar',
    resolve: (data) => typeof data === 'string',
    construct: (data) => readFileSync(basePath + '/' + data).toString(),
  })

const envValueType = new Type('!env', {
  kind: 'scalar',
  resolve: (data) => typeof data === 'string',
  construct: (data) => {
    if (!process.env[data]) process.env.JS_YAML_DEBUG && console.log(`Undefined environment variable ${data}`)
    return process.env[data] || ''
  },
})

const subReplaceType = new Type('!sub', {
  kind: 'scalar',
  resolve: (data) => typeof data === 'string',
  construct: (data) => {
    return Object.entries(process.env).reduce((acc, cur) => acc.replace(`{env:${cur[0]}}`, String(cur[1])), data)
  },
})

const stringifyType = new Type('!stringify', {
  kind: 'mapping',
  construct: (data) => JSON.stringify(data),
})

const querystringType = new Type('!querystring', {
  kind: 'mapping',
  construct: (data) => new URLSearchParams(data).toString(),
})

export const schema = (basePath: string): Schema =>
  DEFAULT_SCHEMA.extend([
    jsType,
    contentType(basePath),
    includeType(basePath),
    subReplaceType,
    envValueType,
    stringifyType,
    querystringType,
  ])

export const load = (filePath: string, options?: LoadOptions): unknown => {
  const content = readFileSync(filePath)
  const basePath = dirname(filePath)

  if (!options?.schema) {
    options = {...options, schema: schema(basePath)}
  }

  return jsYamlLoad(content.toString(), options)
}
