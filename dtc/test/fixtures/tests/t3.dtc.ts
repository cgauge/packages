export default {
  name: 'Test 3',
  unit: {
    act: {
      import: 'syncFunction',
      from: '../functions.js',
      attributes: [{a: 'b'}],
    },
    assert: {
      a: 'b',
    },
  },
}
