import {Plugin, isRecord, sleep} from '@cgauge/dtc'
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
}

export type Playwright = {
  url: string
  actions?: PlaywrightAction[]
}

const isPlaywright = (v: unknown): v is Playwright => isRecord(v) && 'url' in v

const executeActions = async (actions: PlaywrightAction[], page: Page) => {
  for (const act of actions) {
    let actionName: string, actionArgs: undefined | unknown[]
    let element: undefined | Locator

    if (typeof act.target === 'string') {
      const selectorMatch = act.target.match(/[:\[\]#\.]/)
      if (selectorMatch && selectorMatch.length > 0) {
        element = page.locator(act.target)
      } else {
        element =
          (await page.getByTestId(act.target).count()) > 0
            ? page.getByTestId(act.target)
            : (await page.getByPlaceholder(act.target).count()) > 0
            ? page.getByPlaceholder(act.target)
            : (await page.getByText(act.target).count()) > 0
            ? page.getByText(act.target)
            : (await page.getByTitle(act.target).count()) > 0
            ? page.getByTitle(act.target)
            : (await page.getByLabel(act.target).count()) > 0
            ? page.getByLabel(act.target)
            : (await page.getByRole(act.target as 'status').count()) > 0
            ? page.getByRole(act.target as 'status')
            : page.locator(act.target)
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
      } else if (act.fill) {
        await element.fill(act.fill)
      } else if (act.click) {
        await element.click({timeout: 5000})
      } else if (act.toBeVisible) {
        await expect(element.first()).toBeVisible()
      }
    }
  }
}

export class PlaywrightPlugin implements Plugin {
  private page?: Page

  setTestRunnerArgs(args: unknown) {
    if (isRecord(args) && args.page) {
      this.page = args.page as Page
    }
  }

  async arrange(args: unknown) {
    if (!this.page) {
      throw new Error('Page not defined')
    }

    if (!isPlaywright(args)) {
      return
    }

    await this.page.goto(args.url)

    if (!args.actions) {
      return
    }

    await executeActions(args.actions, this.page)
  }

  async act(args: unknown) {
    if (!this.page) {
      throw new Error('Page not defined')
    }

    if (!isPlaywright(args)) {
      return
    }

    await sleep(300)

    await this.page.goto(args.url)

    if (!args.actions) {
      return
    }

    await executeActions(args.actions, this.page)
  }

  async assert(args: unknown) {
    if (!this.page) {
      throw new Error('Page not defined')
    }

    if (!isRecord(args) || !('playwright' in args)) {
      return
    }

    if (!args.playwright || !Array.isArray(args.playwright)) {
      return
    }

    await executeActions(args.playwright, this.page)
  }
}
