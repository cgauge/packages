import {test} from 'node:test'
import nodeAssert from 'node:assert'
import {loadTestCases} from '../src/loader.ts'
import {defaultLoader} from '../src/index.ts'
import { dirname } from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('It loads single file test cases', async () => {
  const testCaseExecutions = await loadTestCases(__dirname, defaultLoader, /.*\.dtc\.[jt]s?$/, `${__dirname}/fixtures/t1.dtc.ts`)

  nodeAssert.equal(`${__dirname}/fixtures/t1.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 1', testCaseExecutions[0].testCase.name)
})

test('It loads files using regex', async () => {
  const testCaseExecutions = await loadTestCases(__dirname, defaultLoader, /.*\.dtc\.[jt]s?$/)

  nodeAssert.ok(testCaseExecutions.length > 1)
  
  nodeAssert.equal(`${__dirname}/fixtures/t1.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 1', testCaseExecutions[0].testCase.name)

  nodeAssert.equal(`${__dirname}/fixtures/t2.dtc.ts`, testCaseExecutions[1].filePath)
  nodeAssert.equal('Test 2 (provider 0)', testCaseExecutions[1].testCase.name)
})

test('It replaces parameters placeholders', async () => {
  const testCaseExecutions = await loadTestCases(__dirname, defaultLoader, /.*\.dtc\.[jt]s?$/, `${__dirname}/fixtures/t1.dtc.ts`)

  nodeAssert.equal(`${__dirname}/fixtures/t1.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 1', testCaseExecutions[0].testCase.name)

  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.act?.arguments, [{a: 'b', d: 'e'}])
  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.assert, {a: 'b'})
})

test('It replaces multiple parameters placeholders', async () => {
  const testCaseExecutions = await loadTestCases(__dirname, defaultLoader, /.*\.dtc\.[jt]s?$/, `${__dirname}/fixtures/t2.dtc.ts`)

  nodeAssert.equal(`${__dirname}/fixtures/t2.dtc.ts`, testCaseExecutions[0].filePath)
  nodeAssert.equal('Test 2 (provider 0)', testCaseExecutions[0].testCase.name)
  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.act?.arguments, [{a: 'b'}])
  nodeAssert.deepStrictEqual(testCaseExecutions[0].testCase.assert, {a: 'b'})

  nodeAssert.equal(`${__dirname}/fixtures/t2.dtc.ts`, testCaseExecutions[1].filePath)
  nodeAssert.equal('Test 2 (provider 1)', testCaseExecutions[1].testCase.name)
  nodeAssert.deepStrictEqual(testCaseExecutions[1].testCase.act?.arguments, [{a: 'c'}])
  nodeAssert.deepStrictEqual(testCaseExecutions[1].testCase.assert, {a: 'c'})
})
