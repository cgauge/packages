export default {
  name: 'Test 3',
  act: {
    import: 'syncFunction',
    from: '../functions.js',
    arguments: [{a: 'b'}],
  },
  assert: {
    a: 'b',
  },
}
