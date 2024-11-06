import {executeTestCase, resolveConfig, loadTestCases} from '@cgauge/dtc'
import {test} from '@playwright/test'

const path = process.env.DTC_PLAYWRIGHT_PATH
const config = String(process.env.DTC_PLAYWRIGHT_CONFIG)

const {loader, plugins, testRegex} = await resolveConfig(config)
const projectPath = process.cwd()

const testCaseExecutions = await loadTestCases(projectPath, loader, testRegex, path)

for (const {filePath, testCase} of testCaseExecutions) {
    if (testCase.use) {
        test.use(testCase.use)
    }

    test(testCase.name, async ({page}) => {
        testCase.timeout && test.setTimeout(testCase.timeout)
        await executeTestCase(testCase, plugins, filePath, {page})
    })
}
