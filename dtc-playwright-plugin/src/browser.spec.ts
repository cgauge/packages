import {executeTestCase, resolveConfig} from '@cgauge/dtc'
import {test} from '@playwright/test'

const path = process.env.DTC_PLAYWRIGHT_PATH
const type = String(process.env.DTC_PLAYWRIGHT_TYPE)
const config = String(process.env.DTC_PLAYWRIGHT_CONFIG)

const {testCaseExecutions, plugins} = await resolveConfig(path, config)

for (const {filePath, testCase} of testCaseExecutions) {
    test(testCase.name, async ({page}) => executeTestCase(testCase[type], plugins[type], filePath, {page}))
}
