import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'Test if call a script with a function works',
  act: {
    script: `${__dirname}/tests.js:testCase4`,
  }
}
