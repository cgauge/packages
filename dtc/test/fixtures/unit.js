export default {
  name: 'Unit test',
  unit: {
    act: {
      import: 'syncFunction',
      from: './functions.js',
      arguments: [
        {a: 'b'}
      ]
    },
    assert: {
      a: 'b'
    }
  }
}