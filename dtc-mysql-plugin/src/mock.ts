import mysql from 'mysql2/promise'
import {mock} from 'node:test'

const methods: Record<string, unknown>[] = []
let calls = 0

mock.method(mysql, 'createConnection', async () => {
  return methods[calls++]
})

export const createConnection = (overridingMethods: Partial<mysql.Connection>) => {
  methods.push({
    beginTransaction: mock.fn(),
    query: mock.fn(),
    execute: mock.fn(),
    commit: mock.fn(),
    rollback: mock.fn(),
    end: mock.fn(),
    ...overridingMethods,
  })
}

export const result = (data?: unknown): mysql.QueryResult => [data as mysql.RowDataPacket[], []]

export const emptyResult: mysql.QueryResult = [[] as mysql.RowDataPacket[], []]
