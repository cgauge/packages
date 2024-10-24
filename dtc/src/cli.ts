#!/usr/bin/env node

import {cli} from 'cleye'
import {resolveConfig} from './config.js'
import {loadTestCases} from './loader.js'

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
  throw new Error(`No test runner found`)
}

await runner(testCaseExecutions, plugins, argv._.runnerArgs, config)
