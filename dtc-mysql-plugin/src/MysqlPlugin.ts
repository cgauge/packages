import {isRecord, Plugin} from '@cgauge/dtc'
import mysql, {ConnectionOptions} from 'mysql2/promise'

type MysqlUpdate = {
  keys: Record<string, unknown>
  set: Record<string, unknown>
}

type Mysql = {
  connection: ConnectionOptions,
  table: string,
  update?: MysqlUpdate
  delete?: Record<string, unknown>,
  insert?: Record<string, unknown>,
}

const isMysql = (v: unknown): v is {mysql: Mysql[]} => isRecord(v) && 'mysql' in v

const executeMysqlStatement = async (statement: Mysql) => {
  let sql: string | undefined
  let variables: Record<string, unknown> = {}

  if (statement.update) {
    const set = Object.keys(statement.update.set).map((v) => `\`${v}\` = :${v}`).join(',')
    const keys = Object.keys(statement.update.keys).map((v) => `\`${v}\` = :${v}`).join(' AND ')
    sql = `UPDATE \`${statement.table}\` SET ${set} WHERE ${keys}`
    variables = {...statement.update.set, ...statement.update.keys}
  }

  if (statement.insert) {
    const keys = Object.keys(statement.insert)
    const fields = keys.join('`,`')
    const values = keys.map((v) => `:${v}`).join(',')
    sql = `INSERT INTO \`${statement.table}\` (\`${fields}\`) VALUES (${values})`
    variables = statement.insert
  }

  if (statement.delete) {
    const keys = Object.keys(statement.delete).map((v) => `\`${v}\` = :${v}`).join(' AND ')
    sql = `DELETE FROM \`${statement.table}\` WHERE ${keys}`
    variables = statement.delete
  }

  const connection = await mysql.createConnection({namedPlaceholders: true, ...statement.connection})

  try {
    if (sql) {
      await connection.execute(sql, variables)
    }
  } catch (e) {
    throw e
  } finally {
    await connection.end()
  }
}

export class MysqlPlugin implements Plugin {
  async arrange(args: unknown): Promise<any> {
    if (!isMysql(args) || !Array.isArray(args.mysql)) {
      return
    }

    await Promise.all(args.mysql.map(executeMysqlStatement))
  }

  async assert(args: unknown) {
    if (!isMysql(args) || !Array.isArray(args.mysql)) {
      return
    }

    await Promise.all(args.mysql.map(executeMysqlStatement))
  }
}
