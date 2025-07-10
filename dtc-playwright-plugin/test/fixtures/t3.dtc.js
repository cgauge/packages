import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'Test case 3',
  act: {
    url: `file://${__dirname}/login.html`,
    actions: [
      {
        javaScript: `${__dirname}/extends-javascript.js`
      }
    ],
  }
}
