import {fileURLToPath} from 'url'
import {dirname} from 'path'
import {expect} from '@playwright/test'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async (page) => {
  await page.goto(`file://${__dirname}/funny.html`);

  await page.click('#click-me');

  await expect(page.locator('h1')).toHaveCount(0);
}

export const testCase4 = async (page, args) => {
  await page.goto(`file://${__dirname}/funny.html`);

  await page.locator('input[name="mytext"]').fill(args.text);

  await page.click('#submit');

  expect(await page.locator('#result').textContent()).toBe(args.text);
}

