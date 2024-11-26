import {Page, expect, Locator} from '@playwright/test'
import {is, unknown, record, union, optional, TypeFromSchema} from '@cgauge/type-guard'

const PlaywrightActionTarget = {
  name: union('getByTestId', 'getByPlaceholder', 'getByText', 'getByTitle', 'getByLabel'),
  args: [unknown],
}

const PlaywrightActionArgs = {
  name: String,
  args: optional([unknown]),
}

const PlaywrightAction = {
  target: union(String, PlaywrightActionTarget),
  action: optional(union(String, PlaywrightActionArgs)),
  fill: optional(String),
  click: optional(Boolean),
  toBeVisible: optional(Boolean),
  options: optional(record(String, unknown)),
}
type PlaywrightAction = TypeFromSchema<typeof PlaywrightAction>

const Playwright = {
  url: String,
  actions: optional([PlaywrightAction]),
  options: optional(record(String, unknown)),
}

const PlaywrightAssert = {
  url: optional(String),
  actions: optional([PlaywrightAction]),
  options: optional(record(String, unknown)),
}

const executeActions = async (actions: PlaywrightAction[], page: Page) => {
  for (const act of actions) {
    let actionName: string, actionArgs: undefined | unknown[]
    let element: undefined | Locator

    if (typeof act.target === 'string') {
      const selectorMatch = act.target.match(/[:\[\]#\.]/)
      if (selectorMatch && selectorMatch.length > 0) {
        element = page.locator(act.target)
      } else {
        element = page.getByTestId(act.target)
      }
    } else {
      if (typeof page[act.target.name] === 'function') {
        element = page[act.target.name].apply(page, act.target.args as [string])
      }
    }

    if (element) {
      if (act.action) {
        if (typeof act.action === 'string') {
          actionName = act.action
        } else {
          actionName = act.action.name
          actionArgs = act.action.args
        }

        //@ts-ignore
        await element[actionName].apply(element, actionArgs)
      } else if (act.fill !== undefined) {
        await element.fill(act.fill, act.options)
      } else if (act.click !== undefined) {
        await element.click(act.options)
      } else if (act.toBeVisible !== undefined) {
        await expect(element.first()).toBeVisible({visible: act.toBeVisible, ...act.options})
      }
    }
  }
}

export const arrange = async (args: unknown, _basePath: string, {page}: {page: Page}) => {
  if (!page) {
    throw new Error('Page not defined')
  }
  
  if (!is(args, {playwright: Playwright})) {
    return
  }

  await page.goto(args.playwright.url, args.playwright.options)

  if (!args.playwright.actions) {
    return
  }

  await executeActions(args.playwright.actions, page)
}

export const act = async (args: unknown, _basePath: string, {page}: {page: Page}) => {
  if (!page) {
    throw new Error('Page not defined')
  }

  if (!is(args, Playwright)) {
    return
  }

  await page.goto(args.url, args.options)

  if (!args.actions) {
    return
  }

  await executeActions(args.actions, page)
}

export const assert = async (args: unknown, _basePath: string, {page}: {page: Page}) => {
  if (!page) {
    throw new Error('Page not defined')
  }

  if (!is(args, {playwright: PlaywrightAssert})) {
    return
  }

  if (args.playwright.url) {
    await page.goto(args.playwright.url, args.playwright.options)
  }

  if (!args.playwright.actions) {
    return
  }

  await executeActions(args.playwright.actions, page)
}
