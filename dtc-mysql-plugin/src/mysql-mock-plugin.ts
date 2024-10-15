import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import {debug, isRecord} from '@cgauge/dtc'
import {Mock, mock} from 'node:test'
import * as mysql from './mock.js'
import nodeSqlParser from 'node-sql-parser'

type MockMysql = {
  input: string
  output?: Record<string, unknown>
  variables?: Record<string, unknown>
}

const isMockMysql = (v: unknown): v is {mysql: MockMysql[]} => isRecord(v) && 'mysql' in v

let arrangeMysql: MockMysql[][] = []
let executions: Mock<any>[] = []

export const arrange = async (args: unknown) => {
  if (!isMockMysql(args)) {
    return
  }

  if (Array.isArray(args.mysql)) {
    arrangeMysql = [args.mysql]
  } else {
    arrangeMysql = Object.values(args.mysql)
  }

  for (const [index, arrange] of arrangeMysql.entries()) {
    executions.push(mock.fn())

    for (const i of arrange.keys()) {
      if (arrange[i].output) {
        executions[index].mock.mockImplementationOnce(async () => mysql.result(arrange[i].output), i)
      } else {
        executions[index].mock.mockImplementationOnce(async () => mysql.emptyResult, i)
      }
    }

    mysql.createConnection({execute: executions[index]})
  }
}

export const assert = () => {
  const parser = new nodeSqlParser.Parser()

  for (const [index, arrange] of arrangeMysql.entries()) {
    const calls = executions[index].mock.calls

    if (calls.length !== arrange.length) {
      debug(`Arrangements: ${JSON.stringify(arrange)}\n`)

      throw new Error(`Number of MySQL calls is not equal the number of arrangements.
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

    nodeAssert.equal(executions[index].mock.calls.length, arrange.length)
  }
  
  arrangeMysql = []
  executions = []
}
