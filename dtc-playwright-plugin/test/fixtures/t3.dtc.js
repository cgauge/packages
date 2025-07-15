import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'Test if call a script works',
  act: {
    script: {
      path: `${__dirname}/tests.js`
    },
  }
}
