import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  name: 'Test case 2',
  arrange: {
    playwright: {
      url: `file://${__dirname}/login.html`,
      actions: [
        {
          target: 'username-test-id',
          fill: '',
        },
        {
          target: {
            name: 'getByPlaceholder',
            args: ['Your password'],
          },
          action: {
            name: 'fill',
            args: [''],
          },
        },
        {
          target: {
            name: 'getByRole',
            args: [
              'button',
              {
                type: 'submit',
              },
            ],
          },
          action: {
            name: 'click',
          },
        },
        {
          target: 'input#username[required]:invalid',
          toBeVisible: true,
        },
      ],
    },
  },
  act: {
    url: `file://${__dirname}/index.html`,
  },
  assert: {
    playwright: {
      actions: [
        {
          target: {
            name: 'getByText',
            args: ['Index page'],
          },
          toBeVisible: true,
        },
      ],
    },
  },
}
