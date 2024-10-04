export default {
  name: 'Unit test',
  unit: {
    act: {
      import: 'syncFunction',
      from: './functions.js',
      attributes: [
        {a: 'b'}
      ]
    },
    assert: {
      a: 'b'
    }
  }
}