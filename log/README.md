# LOG

A logger with namespaces and level

## Usage

```js
//log.js
import createLogger from '@cgauge/log'

const namespace = 'test'
const logger = createLogger(namespace)

logger.debug('message')
```
Execute:
```sh
NODE_DEBUG=test LOG_LEVEL=debug node log.js
#output: TEST 30615: DEBUG 'message'

# Default log level is INFO
NODE_DEBUG=test node log.js
#output: 
```
