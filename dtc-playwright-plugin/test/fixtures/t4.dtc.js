import {fileURLToPath} from 'url'
import path, {dirname} from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'Test if call a script with a function works',
  act: {
    script: {
      path: `${__dirname}/tests.js`,
      functionName: 'testCase4',
      args: {
        text: 'Hello World',
      }
    },
  }
}
