export default {
  parameters: {
    a: 'b',
  },
  layers: [
    {path: 'layer4.json', parameters: {b: '${a}'}}
  ],
  name: 'Test 4',
  act: {
    import: 'syncFunction',
    from: 'functions.js',
    arguments: [
      {a: 'content ${a}'},
    ],
  },
  assert: {
    a: 'content ${a}'
  },
}
