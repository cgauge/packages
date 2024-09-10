export default {
  name: 'Test case',
  playwright: {
    act: {
      url: 'http://login.eu.customergauge.com',
      actions: [
        {
          target: 'Your username',
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
                name: 'Log in',
              },
            ],
          },
          action: {
            name: 'click',
          },
        },
      ],
    },
    assert: {
      playwright: [
        {
          target: {
            name: 'getByText',
            args: [
              'This field is required.',
              {
                id: '#username-error',
              },
            ],
          },
          toBeVisible: true,
        },
      ],
    },
  },
}
