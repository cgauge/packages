export default {
  name: 'Test 1',
  unit: {
    act: {
      import: 'syncFunction',
      from: 'functions.js',
      arguments: [{a: 'b'}],
    },
    assert: {
      a: 'b',
    },
  },
}
