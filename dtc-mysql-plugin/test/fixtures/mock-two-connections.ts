export default {
  name: 'Mysql Mock',
  arrange: {
    mysql: {
      one: [
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
      two: [
        {
          input: 'SELECT :varTwo',
          variables: {
            var: 'value',
          },
          output: {
            var: 'value',
          },
        },
      ],
    },
  },
  act: {
    import: 'queryTwo',
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
