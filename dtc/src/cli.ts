#!/usr/bin/env node

import {cli} from 'cleye'
import {resolveConfig} from './config.js'

const argv = cli({
  name: 'cli.ts',
  parameters: ['<path>'],
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
const path = `${process.cwd()}/${argv._.path}`

const {testCase, plugins} = await resolveConfig(path, config)

if (!(type in testCase)) {
  throw new Error(`Invalid test type (${type})`)
}

if (!(type in plugins)) {
  throw new Error(`No plugins found for this type (${type})`)
}

if (!plugins.boot.length) {
  throw new Error(`No boot plugin found`)
}

await Promise.all(plugins.boot.map((plugin) => plugin.boot?.(path, testCase, plugins, type, config)))
