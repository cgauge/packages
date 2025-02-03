export default {
  parameters: {
    a: 'b',
  },
  layers: ['layer4.json'],
  name: 'Test 4',
  act: {
    import: 'syncFunction',
    from: 'functions.js',
    arguments: [
      {a: 'content ${a} more ${b}', b: '${b} content', c: '${c}', d: '${c.d}'},
    ],
  },
  assert: {
    a: 'content ${a} more ${b}'
  },
}
