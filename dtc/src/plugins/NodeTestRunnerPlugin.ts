import {executeTestCase} from '../index.js'
import type {Plugin, TestCase, Plugins} from '../domain'
import test from 'node:test'

export class NodeTestRunnerPlugin implements Plugin {
  async boot(_path: string, testCase: TestCase, plugins: Plugins, runner: string): Promise<any> {
    test(testCase.name, (args) => executeTestCase(testCase[runner], plugins[runner], args))
  }
}