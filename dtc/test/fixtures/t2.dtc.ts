export default {
  name: 'Test 2',
  parameters: [
    {a: 'b', b: '${a}'},
    {a: 'c', b: '${a}'},
  ],
  act: {
    import: 'syncFunction',
    from: 'functions.js',
    arguments: [{a: '${a}'}],
  },
  assert: {
    a: '${b}',
  },
}
