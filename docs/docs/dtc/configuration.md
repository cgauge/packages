---
title: Configuration
layout: default
parent: DTC
nav_order: 2
---

# Configuration

It is possible to configure custom loaders, runners, test types and plugins.

## Custom configuration

```js
// dtc.config.js
export default {
  loader: async (filePath) => customLoader(filePath),
  runner: new CustomTestRunner(),
  plugins: {
    unit: [new CustomPlugin()],
    customTestType: [new CustomPlugin(), new AnotherPlugin()],
  },
  testRegex: /.*\.dtc\.[jt]s?$/
}
```

## Using a configuration

```sh
npx dtc -c dtc.config.js
```

## Executing a custom test type

```sh
npx dtc -c dtc.config.js -t customTestType
```