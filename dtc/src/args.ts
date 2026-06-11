import {parseArgs} from 'node:util'

export type ParsedCliArgs = {
  configPath: string | undefined
  filePath: string | undefined
  runnerArgs: string[]
  help: boolean
}

export const parseCliArgs = (argv: string[]): ParsedCliArgs => {
  const {values, positionals, tokens} = parseArgs({
    args: argv,
    options: {
      config: {type: 'string', short: 'c'},
      help: {type: 'boolean', short: 'h', default: false},
    },
    strict: true,
    allowPositionals: true,
    tokens: true,
  })

  const separatorIndex = tokens.findIndex((t) => t.kind === 'option-terminator')
  let filePath: string | undefined
  let runnerArgs: string[] = []

  if (separatorIndex !== -1) {
    const separatorToken = tokens[separatorIndex]
    filePath =
      positionals.length > 0 && tokens.some((t) => t.kind === 'positional' && t.index < separatorToken.index)
        ? positionals[0]
        : undefined
    runnerArgs = argv.slice(separatorToken.index + 1)
  } else {
    filePath = positionals[0]
  }

  return {
    configPath: values.config,
    filePath,
    runnerArgs,
    help: values.help as boolean,
  }
}

const HELP_TEXT = `Usage: dtc [filePath] [--config <path>] [-- runnerArgs...]

Options:
  -c, --config <path>  Configuration file path
  -h, --help           Show this help message`

export const printHelp = (): void => {
  console.log(HELP_TEXT)
}
