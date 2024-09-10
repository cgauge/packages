import mysql from 'mysql2/promise'
import {mock, Mock} from 'node:test'

export const createConnection = (overridingMethods: Partial<mysql.Connection>): Mock<Function> =>
  mock.method(mysql, 'createConnection', async () => ({
    beginTransaction: mock.fn(),
    query: mock.fn(),
    execute: mock.fn(),
    commit: mock.fn(),
    rollback: mock.fn(),
    end: mock.fn(),
    ...overridingMethods,
  }))

export const result = (data?: unknown): mysql.QueryResult => [data as mysql.RowDataPacket[], []]

export const emptyResult: mysql.QueryResult = [[] as mysql.RowDataPacket[], []]
