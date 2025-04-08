#!/usr/bin/env node

import {cli} from 'cleye'
import {resolveConfig} from './config.js'
import {loadTestCases} from './loader.js'
import {error, warnExit} from './utils.js'

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

const configPath = argv.flags.config
const filePath = argv._.filePath
const projectPath = process.cwd()

const config = await resolveConfig(configPath)

if (!config.runner) {
  warnExit(`No test runner found`)
}

if (config.plugins.length === 0) {
  warnExit('No plugins defined')
}

const testCaseExecutions = await loadTestCases(projectPath)(config)(filePath)

if (testCaseExecutions.length === 0) {
  warnExit(`No test cases found for test regex: ${config.testRegex}`)
}

try {
  await config.runner(testCaseExecutions, config.plugins, argv._.runnerArgs, configPath)
} catch (e: any) {
  error(e.message)
}
