import {is, unknown, record, union, optional, TypeFromSchema} from '@cgauge/type-guard'
import {render, fireEvent, RenderResult, cleanup, Queries} from '@testing-library/react'
import nodeAssert from 'node:assert'
import React from 'react'

import 'global-jsdom/register'

const ReactActionTarget = {
  name: String,
  args: [unknown],
}

const ReactActionArgs = {
  name: String,
  args: optional([unknown]),
}

const ReactAction = {
  target: union(String, ReactActionTarget),
  action: optional(union(String, ReactActionArgs)),
  fill: optional(String),
  click: optional(Boolean),
  toBeVisible: optional(Boolean),
  options: optional(record(String, unknown)),
}
type ReactAction = TypeFromSchema<typeof ReactAction>

const ReactArrange = {
  import: String,
  from: String,
  properties: optional(record(String, unknown)),
}

const ReactAct = [ReactAction]

const ReactAssert = [ReactAction]

let component: RenderResult<Queries, HTMLElement, HTMLElement> | null = null

const isVisible = (element: HTMLElement): boolean => 
  element.style.display !== 'none'

const executeActions = async (actions: ReactAction[], component: RenderResult<Queries, HTMLElement, HTMLElement>) => {
  for (const act of actions) {
    let actionName: string, actionArgs: undefined | unknown[]
    let element: null | HTMLElement | Error | HTMLElement[] = null

    if (typeof act.target === 'string') {     
        element = await component.getByTestId(act.target)
    } else {
      if (typeof (component as any)[act.target.name] === 'function') {
        element = await (component as any)[act.target.name].apply(component, act.target.args as [string])
      }
    }

    if (!element || element instanceof Error) {
      throw new Error(`Element ${JSON.stringify(act.target)} not found`)
    }

    if (Array.isArray(element)) {
      element = element[0]
    }

    if (act.action) {
      if (typeof act.action === 'string') {
        actionName = act.action
      } else {
        actionName = act.action.name
        actionArgs = act.action.args
      }

      //@ts-ignore
      nodeAssert.ok(element[actionName].apply(element, actionArgs))
    } else if (act.fill !== undefined) {
      fireEvent.input(element, {target: {value: act.fill}})
    } else if (act.click !== undefined) {
      fireEvent.click(element, act.options)
    } else if (act.toBeVisible !== undefined) {
      act.toBeVisible 
        ? nodeAssert.ok(isVisible(element), `Element ${JSON.stringify(act.target)} is not visible`)
        : nodeAssert.ok(!isVisible(element), `Element ${JSON.stringify(act.target)} is visible`)
    }
  }
}

export const arrange = async (args: unknown, basePath: string) => {
  if (!is(args, ReactArrange)) {
    return
  }

  cleanup()

  const componentModule = await import(basePath + '/' + args.from)
  
  component = render(React.createElement(componentModule[args.import]), {...args.properties})
}

export const act = async (args: unknown, _basePath: string) => {
  if (!is(args, ReactAct)) {
    return
  }

  if (!component) {
    throw new Error('Component not defined in arrange.')
  }

  await executeActions(args, component)
}

export const assert = async (args: unknown, _basePath: string) => {
  if (!is(args, ReactAssert)) {
    return
  }

  if (!component) {
    throw new Error('Component not defined in arrange.')
  }

  await executeActions(args, component)
}
