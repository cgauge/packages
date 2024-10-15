import {executeTestCase, resolveConfig} from '@cgauge/dtc'
import {test} from '@playwright/test'

const path = process.env.DTC_PLAYWRIGHT_PATH
const config = String(process.env.DTC_PLAYWRIGHT_CONFIG)

const {testCaseExecutions, plugins} = await resolveConfig(path, config)

for (const {filePath, testCase} of testCaseExecutions) {
    test(testCase.name, async ({page}) => executeTestCase(testCase, plugins, filePath, {page}))
}
