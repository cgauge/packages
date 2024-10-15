#!/usr/bin/env node

import {cli} from 'cleye'
import {resolveConfig} from './config.js'

const argv = cli({
  name: 'cli.ts',
  parameters: [],
  flags: {
    config: {
      alias: 'c',
      type: String,
      description: 'Configuration file path',
    },
  },
})

const config = argv.flags.config
const filePath = argv._[0] ?? null

const {testCaseExecutions, plugins, runner} = await resolveConfig(filePath, config)

if (!runner) {
  throw new Error(`No test runner found`)
}

await runner(testCaseExecutions, plugins, config)
