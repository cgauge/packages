#!/usr/bin/env node

import {parseCliArgs, printHelp} from './args.js'
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
    warnExit(`No test cases found for test pattern: ${config.testPattern}`)
  }

  await config.runner(testCaseExecutions, config.plugins, runnerArgs, configPath, filePath)
}

try {
  const parsed = parseCliArgs(process.argv.slice(2))

  if (parsed.help) {
    printHelp()
    process.exit(0)
  }

  await main({
    projectPath: process.cwd(),
    configPath: parsed.configPath,
    filePath: parsed.filePath,
    runnerArgs: parsed.runnerArgs,
  })
} catch (e: any) {
  error(`${e.code}: ${e.message}`)
}
