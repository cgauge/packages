#!/usr/bin/env node

import {cli} from 'cleye'
import {resolveConfig} from './config.js'

const argv = cli({
  name: 'cli.ts',
  parameters: [],
  flags: {
    type: {
      alias: 't',
      type: String,
      description: 'Test type to be executed (unit, narrow, broad, ...)',
      default: 'unit',
    },
    config: {
      alias: 'c',
      type: String,
      description: 'Configuration file path',
    },
  },
})

const type = argv.flags.type
const config = argv.flags.config
const filePath = argv._[0] ?? null

const {testCaseExecutions, plugins, runner} = await resolveConfig(filePath, config)

for (const {testCase} of testCaseExecutions) {
  if (!(type in testCase)) {
    throw new Error(`Invalid test type (${type})`)
  }
}

if (!(type in plugins)) {
  throw new Error(`No plugins found for this type (${type})`)
}

if (!runner) {
  throw new Error(`No test runner found`)
}

await runner.run(testCaseExecutions, plugins, type, config)
