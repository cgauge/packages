export default {
  name: 'Mysql Invalid query',
  parameters: ['value'],
  narrow: {
    arrange: {
      mysql: [
        {
          input: 'invalid query',
        },
      ],
    },
    act: {
      import: 'query',
      from: './mysql.ts',
      arguments: [
        {
          var: 'value',
        },
      ],
    },
  },
}
