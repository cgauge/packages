---
title: Quick Start
layout: default
parent: DTC
nav_order: 1
---

# Quick Start

## Installation

```sh
npm install -D @cgauge/dtc
```

### Target file

```js
// hello.js
export const greeting = (name) => `Hello ${name}`
```

### Test case
```js
// hello.dtc.js
export default {
  name: 'My first test case',
  unit: {
    act: {
      import: 'greeting',
      from: './hello.js',
      arguments: ['World']
    },
    assert: 'Hello World'
  }
}
```

### Executing

```sh
npx dtc
```

### Result

```sh
✔ My first test case
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```