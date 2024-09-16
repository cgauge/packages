export default {
  name: 'Mysql Mock',
  parameters: ['value'],
  narrow: {
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
          {
            input: 'SELECT :varThree',
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
      attributes: [
        {
          var: 'value',
        },
      ],
    },
    assert: {
      var: 'value',
    },
  },
}
