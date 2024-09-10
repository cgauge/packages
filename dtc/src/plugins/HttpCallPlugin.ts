import type {Plugin} from '../domain'
import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import {isRecord} from '../utils.js'

type HttpCall = {url: string} & RequestInit

const isHttpCall = (v: unknown): v is HttpCall => isRecord(v) && 'url' in v

export class HttpCallPlugin implements Plugin {
  private response?: Response

  async act(args: unknown): Promise<any> {
    if (!isHttpCall(args)) {
      return
    }

    this.response = await fetch(args.url, args)
  }

  async assert(args: unknown) {
    if (isRecord(args)) {
      if (isRecord(args.http)) {
        extraAssert.objectContains(await this.response?.json(), args.http)
      } else {
        nodeAssert.deepStrictEqual(await this.response?.text(), args.http)
      }
    }
  }
}
