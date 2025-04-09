#!/usr/bin/env node

import {cli} from 'cleye'
import {resolveConfig} from './config.js'
import {loadTestCases} from './loader.js'
import {error, warnExit} from './utils.js'

type CliArgs = {projectPath: string; configPath?: string; filePath?: string; runnerArgs?: string[]}

const main = async ({projectPath, configPath, filePath, runnerArgs}: CliArgs) => {
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

  await config.runner(testCaseExecutions, config.plugins, runnerArgs, configPath)
}

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

try {
  await main({
    projectPath: process.cwd(),
    configPath: argv.flags.config,
    filePath: argv._.filePath,
    runnerArgs: argv._.runnerArgs,
  })
} catch (e: any) {
  error(`${e.code}: ${e.message}`)
}
