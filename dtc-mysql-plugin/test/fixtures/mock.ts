export default {
  name: 'Mysql Mock',
  arrange: {
    mysql: [
      {
        input: 'SELECT :var',
        variables: {
          var: 'value',
        },
        output: {
          var: 'value',
        },
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
  assert: {
    var: 'value',
  },
}
