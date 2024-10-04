import {executeTestCase} from '../index.js'
import type {Runner, TestCaseExecution, Plugins} from '../domain.js'
import test from 'node:test'

export class NodeTestRunner implements Runner {
  async run(testCaseExecutions: TestCaseExecution[], plugins: Plugins, type: string): Promise<void> {
    for (const {filePath, testCase} of testCaseExecutions) {
      test(testCase.name, (args) => executeTestCase(testCase[type], plugins[type], filePath, args))
    }
  }
}
