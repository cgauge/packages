import {describe, it, test} from 'node:test'
import nodeAssert from 'node:assert'
import {loadTestCases, isGlobPattern, resolveGlob} from '../src/loader.ts'
import {defaultLoader} from '../src/index.ts'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It loads single file test cases', async () => {
  const testCaseExecutions = await loadTestCases(__dirname)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})(`./fixtures/t1.dtc.ts`)

  nodeAssert.equal(`${__dirname}/fixtures/t1.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 1', testCaseExecutions[0].testCase.name)
})

test('It loads files using glob pattern', async () => {
  const testCaseExecutions = await loadTestCases(__dirname)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})()

  nodeAssert.ok(testCaseExecutions.length > 1)
  
  nodeAssert.equal(`${__dirname}/fixtures/t1.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 1', testCaseExecutions[0].testCase.name)

  nodeAssert.equal(`${__dirname}/fixtures/t2.dtc.ts`, testCaseExecutions[1].filePath)
  nodeAssert.equal('Test 2 (provider 0)', testCaseExecutions[1].testCase.name)
})

test('It replaces parameters placeholders', async () => {
  const testCaseExecutions = await loadTestCases(__dirname)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})(`./fixtures/t1.dtc.ts`)

  nodeAssert.equal(`${__dirname}/fixtures/t1.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 1', testCaseExecutions[0].testCase.name)

  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.act?.arguments, [{a: 'content b more b', b: 'b content', c: {d: 'e'}, d: 'e'}])
  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.assert, {a: 'content b more b'})
})

test('It replaces multiple parameters placeholders', async () => {
  const testCaseExecutions = await loadTestCases(__dirname)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})(`./fixtures/t2.dtc.ts`)

  nodeAssert.equal(`${__dirname}/fixtures/t2.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 2 (provider 0)', testCaseExecutions[0].testCase.name)
  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.act?.arguments, [{a: 'b'}])
  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.assert, {a: 'b'})

  nodeAssert.equal(`${__dirname}/fixtures/t2.dtc.ts`, testCaseExecutions[1].filePath)
  nodeAssert.equal('Test 2 (provider 1)', testCaseExecutions[1].testCase.name)
  nodeAssert.deepStrictEqual(testCaseExecutions[1].testCase.act?.arguments, [{a: 'c'}])
  nodeAssert.deepStrictEqual(testCaseExecutions[1].testCase.assert, {a: 'c'})
})

test('It replaces parameters placeholders defined in the layers', async () => {
  const testCaseExecutions = await loadTestCases(__dirname)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})(`./fixtures/t4.dtc.ts`)

  nodeAssert.equal(`${__dirname}/fixtures/t4.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 4', testCaseExecutions[0].testCase.name)

  nodeAssert.deepStrictEqual(testCaseExecutions[0].resolvedLayers?.[0].parameters, {b: 'b', c: {d: 'e'}})
  nodeAssert.deepStrictEqual(testCaseExecutions[0].resolvedLayers?.[0].arrange, {a: 'b'})
  nodeAssert.deepStrictEqual(testCaseExecutions[0].resolvedLayers?.[1].arrange, {g: 'h'})
  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.act?.arguments, [{a: 'content b'}])
  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.assert, {a: 'content b'})
})

describe('isGlobPattern', () => {
  it('returns false for plain paths', () => {
    nodeAssert.strictEqual(isGlobPattern('test/foo.ts'), false)
    nodeAssert.strictEqual(isGlobPattern('./src/index.ts'), false)
    nodeAssert.strictEqual(isGlobPattern('src/utils/helper.js'), false)
  })

  it('returns true for patterns with * wildcard', () => {
    nodeAssert.strictEqual(isGlobPattern('test/*.ts'), true)
    nodeAssert.strictEqual(isGlobPattern('src/**/*.js'), true)
  })

  it('returns true for patterns with ? wildcard', () => {
    nodeAssert.strictEqual(isGlobPattern('file?.ts'), true)
  })
})

describe('loadTestCases glob branch', () => {
  const fixturesDir = join(__dirname, 'fixtures')

  it('resolves glob pattern and loads multiple test files', async () => {
    const results = await loadTestCases(fixturesDir)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})('*.dtc.ts')

    nodeAssert.ok(results.length >= 3)
    nodeAssert.ok(results.some((r) => r.testCase.name.startsWith('Test 1')))
    nodeAssert.ok(results.some((r) => r.testCase.name.startsWith('Test 2')))
    nodeAssert.ok(results.some((r) => r.testCase.name.startsWith('Test 4')))
  })

  it('glob pattern controls which files are loaded', async () => {
    const results = await loadTestCases(fixturesDir)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})('t1.dtc.ts')

    nodeAssert.ok(results.length >= 1)
    nodeAssert.ok(results.every((r) => r.filePath.includes('t1.dtc.ts')))
  })

  it('returns results in alphabetical order', async () => {
    const results = await loadTestCases(fixturesDir)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})('*.dtc.ts')

    const filePaths = results.map((r) => r.filePath)
    for (let i = 1; i < filePaths.length; i++) {
      nodeAssert.ok(filePaths[i] >= filePaths[i - 1], `Expected ${filePaths[i]} >= ${filePaths[i - 1]}`)
    }
  })

  it('returns empty array when glob matches zero files', async () => {
    const results = await loadTestCases(fixturesDir)({loader: defaultLoader, testPattern: '**/*.dtc.{ts,js}'})('nonexistent-*.dtc.ts')

    nodeAssert.deepStrictEqual(results, [])
  })
})

describe('resolveGlob', () => {
  const fixturesDir = join(__dirname, 'fixtures')

  it('expands * wildcard to match files in a directory', async () => {
    const results = await resolveGlob('*.dtc.ts', fixturesDir)

    nodeAssert.ok(results.includes('t1.dtc.ts'))
    nodeAssert.ok(results.includes('t2.dtc.ts'))
    nodeAssert.ok(results.includes('t4.dtc.ts'))
  })

  it('expands ** for recursive matching', async () => {
    const results = await resolveGlob('**/*.dtc.ts', fixturesDir)

    nodeAssert.ok(results.includes('t1.dtc.ts'))
    nodeAssert.ok(results.includes('t2.dtc.ts'))
    nodeAssert.ok(results.includes('t4.dtc.ts'))
    nodeAssert.ok(results.some((r) => r.includes('tests/t3.dtc.ts')))
  })

  it('expands ? for single-character matching', async () => {
    const results = await resolveGlob('t?.dtc.ts', fixturesDir)

    nodeAssert.ok(results.includes('t1.dtc.ts'))
    nodeAssert.ok(results.includes('t2.dtc.ts'))
    nodeAssert.ok(results.includes('t4.dtc.ts'))
    nodeAssert.ok(!results.includes('t10.dtc.ts'))
  })

  it('returns paths sorted alphabetically', async () => {
    const results = await resolveGlob('*.dtc.ts', fixturesDir)

    const sorted = [...results].sort()
    nodeAssert.deepStrictEqual(results, sorted)
  })
})
