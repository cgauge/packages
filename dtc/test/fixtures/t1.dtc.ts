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
      {a: 'content ${a} more ${b}', c: '${c}', d: '${c.d}'},
    ],
  },
  assert: {
    a: 'content ${a} more ${b}'
  },
}
