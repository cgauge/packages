export default {
  name: 'Mysql Test',
  arrange: {
    mysql: [
      {
        connection: {host: '127.0.0.1', user: 'root', password: '123456', database: 'test'},
        table: 'test',
        insert: {a: 'b', c: 'd', e: 'e', g: 'g'},
      },
      {
        connection: {host: '127.0.0.1', user: 'root', password: '123456', database: 'test'},
        table: 'test',
        delete: {a: 'b', c: 'd'},
      },
      {
        connection: {host: '127.0.0.1', user: 'root', password: '123456', database: 'test'},
        table: 'test',
        update: {
          keys: {a: 'b', c: 'd'},
          set: {e: 'f', g: 'h'},
        },
      },
    ],
  },
  act: {
    import: 'query',
    from: './nothing.ts',
  },
}
