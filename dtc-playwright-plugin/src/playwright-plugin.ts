import {Page, expect, Locator} from '@playwright/test'
import {is, unknown, record, union, optional, TypeFromSchema, diff} from '@cgauge/type-guard'
import {info} from '@cgauge/dtc'

const PlaywrightActionTarget = {
  name: String,
  args: [unknown],
}

const PlaywrightActionArgs = {
  name: String,
  args: optional([unknown]),
}

const PlaywrightAction = {
  target: optional(union(String, PlaywrightActionTarget)),
  action: optional(union(String, PlaywrightActionArgs)),
  fill: optional(String),
  click: optional(union(Boolean, String)),
  keydown: optional(union(Boolean, String)),
  toBeVisible: optional(union(Boolean, String)),
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

const getElement = (page: Page, selector: string): Locator => {
  const selectorMatch = selector.match(/[:\[\]#\.]/)
  return selectorMatch && selectorMatch.length > 0 ? page.locator(selector) : page.getByTestId(selector)
}

const executeActions = async (actions: PlaywrightAction[], page: Page) => {
  for (const act of actions) {
    let actionName: string, actionArgs: undefined | unknown[]
    let element: undefined | Locator

    if (Object.keys(act).length === 0) {
      throw new Error('(Playwright) No action defined')
    }

    if (typeof act.target === 'string') {
      element = getElement(page, act.target)
    } else if (act.target === undefined) {
      const suportedActions = ['click', 'toBeVisible']
      const keys = Object.keys(act).filter((key) => suportedActions.includes(key))
      if (keys.length > 1) {
        throw new Error('(Playwright) Multiple actions defined')
      }
      const key = keys[0]
      if (key === 'toBeVisible' && is(act.toBeVisible, String)) {
        element = getElement(page, act.toBeVisible)
      }
      if (key === 'click' && is(act.click, String)) {
        element = getElement(page, act.click)
      }
    } else {
      if (typeof (page as any)[act.target.name] === 'function') {
        element = (page as any)[act.target.name].apply(page, act.target.args as [string])
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
      } else if (act.keydown !== undefined) {
        await element.focus()
        await element.evaluate((htmlElement, options) => {
          htmlElement.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: 'ArrowDown', ...options}))
        }, act.options)
      } else if (act.toBeVisible !== undefined) {
        await expect(element.first()).toBeVisible({
          visible: act.toBeVisible as unknown as boolean,
          ...act.options
        })
      }
    }
  }
}

export const arrange = async (args: unknown, _basePath: string, {page}: {page: Page}): Promise<boolean> => {
  if (!page) {
    throw new Error('(Playwright) Page not defined')
  }

  if (!('playwright' in (args as any))) {
    return false
  }

  if (!is(args, {playwright: Playwright})) {
    const mismatch = diff(args, {playwright: Playwright})
    throw new Error(`(Playwright) Invalid argument on arrange: ${mismatch[0]}`)
  }

  await page.goto(args.playwright.url, args.playwright.options)

  if (!args.playwright.actions) {
    return true
  }

  await executeActions(args.playwright.actions, page)

  return true
}

export const act = async (args: unknown, _basePath: string, {page}: {page: Page}): Promise<boolean> => {
  if (!page) {
    throw new Error('(Playwright) Page not defined')
  }

  if (!is(args, Playwright)) {
    const mismatch = diff(args, Playwright)
    info(`(Playwright) Plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  await page.goto(args.url, args.options)

  if (!args.actions) {
    return true
  }

  await executeActions(args.actions, page)

  return true
}

export const assert = async (args: unknown, _basePath: string, {page}: {page: Page}) => {
  if (!page) {
    throw new Error('(Playwright) Page not defined')
  }

  if (!('playwright' in (args as any))) {
    return false
  }

  if (!is(args, {playwright: PlaywrightAssert})) {
    const mismatch = diff(args, {playwright: PlaywrightAssert})
    throw new Error(`(Playwright) Invalid argument on assert: ${mismatch[0]}`)
  }

  if (args.playwright.url) {
    await page.goto(args.playwright.url, args.playwright.options)
  }

  if (!args.playwright.actions) {
    return true
  }

  await executeActions(args.playwright.actions, page)

  return true
}
