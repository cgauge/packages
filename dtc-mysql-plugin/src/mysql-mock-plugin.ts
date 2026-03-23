import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import {mock} from 'node:test'
import * as mysql from './mock.js'
import nodeSqlParser from 'node-sql-parser'
import {is, unknown, record, optional, TypeFromSchema, diff} from '@cgauge/type-guard'
import createLogger from '@cgauge/log'

const logger = createLogger('dtc:mysql-mock');

const MockMysql = {
  input: String,
  output: optional(record(String, unknown)),
  variables: optional(record(String, unknown)),
}
type MockMysql = TypeFromSchema<typeof MockMysql>

const arrangeMysql: any = {}
const executions: any = {}

export const arrange = async (args: unknown, basePath: string): Promise<boolean> => {
  if (!('mysql' in (args as any))) {
    return false
  }

  arrangeMysql[basePath] = []
  executions[basePath] = []

  if (is(args, {mysql: [MockMysql]})) {
    arrangeMysql[basePath] = [args.mysql]
  } else if (is(args, {mysql: record(String, [MockMysql])})) {
    arrangeMysql[basePath] = Object.values(args.mysql)
  } else {
    const mismatch = diff(args, {mysql: [MockMysql]})
    throw new Error(`(Mysql Mock) Invalid argument on arrange: ${mismatch[0]}`)
  }

  for (const [index, arrange] of arrangeMysql[basePath].entries()) {
    executions[basePath].push(mock.fn())

    for (const i of arrange.keys()) {
      if (arrange[i].output) {
        executions[basePath][index].mock.mockImplementationOnce(async () => mysql.result(arrange[i].output), i)
      } else {
        executions[basePath][index].mock.mockImplementationOnce(async () => mysql.emptyResult, i)
      }
    }

    mysql.createConnection({execute: executions[basePath][index]})
  }

  return true
}

export const assert = (_args?: unknown, basePath = '') => {
  if (!arrangeMysql[basePath]) {
    return
  }

  const parser = new nodeSqlParser.Parser()

  for (const [index, arrange] of arrangeMysql[basePath].entries()) {
    const calls = executions[basePath][index].mock.calls

    if (calls.length !== arrange.length) {
      logger.debug(`Arrangements: ${JSON.stringify(arrange)}`)

      throw new Error(`(MySQL Mock) Number of MySQL calls is not equal the number of arrangements.
          MySQL Calls: ${calls.length}, Arrangements Calls: ${arrange.length}
        `)
    }

    for (const i of arrange.keys()) {
      const sql = arrange[i].input
      const variables = arrange[i].variables

      nodeAssert.doesNotThrow(() => parser.parse(sql))

      if (variables) {
        nodeAssert.deepEqual(calls[i].arguments[0], sql)
        extraAssert.objectContains(calls[i].arguments[1], variables)
      } else {
        nodeAssert.deepEqual(calls[i].arguments, [sql])
      }
    }

    nodeAssert.equal(executions[basePath][index].mock.calls.length, arrange.length)
  }

  arrangeMysql[basePath] = []
  executions[basePath] = []
}
