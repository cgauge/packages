export default {
  name: 'Unit test',
  act: {
    import: 'syncFunction',
    from: './functions.js',
    arguments: [
      {a: 'b'}
    ]
  },
  assert: {
    a: 'c'
  }
}