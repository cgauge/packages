#!/usr/bin/env node

import {cli} from 'cleye'
import {resolveConfig} from './config.js'
import {loadTestCases} from './loader.js'
import { error, warn, warnExit } from './utils.js'

const argv = cli({
  name: 'dtc',
  parameters: ['[filePath]', '--', '[runnerArgs...]'],
  flags: {
    config: {
      alias: 'c',
      type: String,
      description: 'Configuration file path',
    },
  },
})

const config = argv.flags.config
const filePath = argv._.filePath
const projectPath = process.cwd()

const {loader, plugins, runner, testRegex} = await resolveConfig(config)

const testCaseExecutions = await loadTestCases(projectPath, loader, testRegex, filePath)

if (!runner) {
  warnExit(`No test runner found`)
}

if (testCaseExecutions.length === 0) {
  warnExit(`No test cases found for test regex: ${testRegex}`)
}

if (plugins.length === 0) {
  warnExit('No plugins defined')
}

try {
  await runner(testCaseExecutions, plugins, argv._.runnerArgs, config)
} catch (e: any) {
  error(e.message)
}
