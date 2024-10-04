import {executeTestCase, resolveConfig} from '@cgauge/dtc'
import {test} from '@playwright/test'

const path = String(process.env.DTC_PLAYWRIGHT_FILE_PATH)
const type = String(process.env.DTC_PLAYWRIGHT_TYPE)
const config = String(process.env.DTC_PLAYWRIGHT_CONFIG)

const {testCases, plugins} = await resolveConfig(path, config)

for (const testCase of testCases) {
    test(testCase.name, async ({page}) => executeTestCase(testCase[type], plugins[type], {page}))
}
