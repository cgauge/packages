import {executeTestCase, resolveConfig, loadTestCases} from '@cgauge/dtc'
import {test} from '@playwright/test'

const projectPath = process.cwd()
const path = process.env.DTC_PLAYWRIGHT_PATH?.replace(projectPath, '');
const config = String(process.env.DTC_PLAYWRIGHT_CONFIG)

const {loader, plugins, testRegex} = await resolveConfig(config)

const testCaseExecutions = await loadTestCases(projectPath)({loader, testRegex})(path)

for (const testCaseExecution of testCaseExecutions) {
    if (testCaseExecution.testCase.use) {
        test.use(testCaseExecution.testCase.use)
    }

    test(testCaseExecution.testCase.name ?? testCaseExecution.filePath, async ({page}) => {
        testCaseExecution.testCase.timeout && test.setTimeout(testCaseExecution.testCase.timeout)
        await executeTestCase(testCaseExecution, plugins, {page})
    })
}
