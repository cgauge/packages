import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import {isRecord, Plugin} from '@cgauge/dtc'
import {Mock, mock} from 'node:test'
import * as mysql from './mock.js'
import nodeSqlParser from 'node-sql-parser'

type MockMysql = {
  input: string
  output?: Record<string, unknown>
  variables?: Record<string, unknown>
}

const isMockMysql = (v: unknown): v is {mysql: MockMysql[]} => isRecord(v) && 'mysql' in v

export class MysqlMockPlugin implements Plugin {
  private arrangeMysql: MockMysql[][] = []
  private executions: Mock<any>[] = []

  async arrange(args: unknown): Promise<any> {
    if (!isMockMysql(args)) {
      return
    }

    if (Array.isArray(args.mysql)) {
      this.arrangeMysql = [args.mysql]
    } else {
      this.arrangeMysql = Object.values(args.mysql)
    }

    for (const [index, arrange] of this.arrangeMysql.entries()) {
      this.executions.push(mock.fn())

      for (const i of arrange.keys()) {
        if (arrange[i].output) {
          this.executions[index].mock.mockImplementationOnce(async () => mysql.result(arrange[i].output), i)
        } else {
          this.executions[index].mock.mockImplementationOnce(async () => mysql.emptyResult, i)
        }
      }

      mysql.createConnection({execute: this.executions[index]})
    }
  }

  assert() {
    const parser = new nodeSqlParser.Parser()

    for (const [index, arrange] of this.arrangeMysql.entries()) {
      const calls = this.executions[index].mock.calls

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

      nodeAssert.equal(this.executions[index].mock.calls.length, arrange.length)
    }
  }
}
