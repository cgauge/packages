export default {
  name: 'Test 3',
  unit: {
    act: {
      import: 'syncFunction',
      from: '../functions.js',
      arguments: [{a: 'b'}],
    },
    assert: {
      a: 'b',
    },
  },
}
