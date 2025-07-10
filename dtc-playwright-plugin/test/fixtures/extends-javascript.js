/**
 * @param {{
 *   page: import('@playwright/test').Page,
 *   expect: import('@playwright/test').expect,
 * }}
 * 
 * @returns {Promise<import('@playwright/test').Locator>}
 */
export default async ({ page, expect, debug }) => {
    // page.getByRole('form').getByRole('button', {name: 'Login'})
    // const form = page.getByRole('form')
    console.log(page.locator('form').locator('button'))
}

