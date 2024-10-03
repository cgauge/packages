import {executeTestCase} from '../index.js'
import type {Runner, TestCase, Plugins} from '../domain.js'
import test from 'node:test'

export class NodeTestRunner implements Runner {
  async run(_path: string, testCases: TestCase[], plugins: Plugins, type: string): Promise<any> {
    for (const testCase of testCases) {
      test(testCase.name, (args) => executeTestCase(testCase[type], plugins[type], testCase.fileName, args))
    }
  }
}
