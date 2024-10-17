export default {
  parameters: {
    a: 'b',
    b: '${a}',
    c: {
      d: 'e'
    }
  },
  name: 'Test 1',
  act: {
    import: 'syncFunction',
    from: 'functions.js',
    arguments: [
      {a: '${a}', d: '${c.d}'},
    ],
  },
  assert: {
    a: '${b}',
  },
}
