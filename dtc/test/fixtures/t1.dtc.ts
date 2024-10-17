export default {
  parameters: {
    a: 'b',
    b: '${a}',
  },
  name: 'Test 1',
  act: {
    import: 'syncFunction',
    from: 'functions.js',
    arguments: [{a: '${a}'}],
  },
  assert: {
    a: '${b}',
  },
}
