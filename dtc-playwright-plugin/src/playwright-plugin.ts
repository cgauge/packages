import {isRecord} from '@cgauge/dtc'
import {Page, expect, Locator} from '@playwright/test'

type PlaywrightActionTarget = {
  name: 'getByTestId' | 'getByPlaceholder' | 'getByText' | 'getByTitle' | 'getByLabel'
  args: [string | RegExp]
}

type PlaywrightActionArgs = {
  name: string
  args?: unknown[]
}

type PlaywrightAction = {
  target: string | PlaywrightActionTarget
  action?: string | PlaywrightActionArgs
  fill?: string
  click?: boolean
  toBeVisible?: boolean
  options?: Record<string, unknown>
}

export type Playwright = {
  url: string
  actions?: PlaywrightAction[]
  options?: Record<string, unknown>
}

export type PlaywrightAssert = {
  url?: string
  actions?: PlaywrightAction[]
  options?: Record<string, unknown>
}

const isPlaywright = (v: unknown): v is Playwright => isRecord(v) && 'url' in v
const isPlaywrightAssert = (v: unknown): v is Playwright => isRecord(v) && 'actions' in v

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
        element = page[act.target.name].apply(page, act.target.args)
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
  
  if (!isRecord(args) || !('playwright' in args)) {
    return
  }
  
  if (!isPlaywright(args.playwright)) {
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

  if (!isPlaywright(args)) {
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

  if (!isRecord(args) || !('playwright' in args)) {
    return
  }

  if (!isPlaywrightAssert(args.playwright)) {
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
