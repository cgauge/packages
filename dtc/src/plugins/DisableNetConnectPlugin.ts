import type {Plugin} from '../domain'
import nock from 'nock'

export class DisableNetConnectPlugin implements Plugin {
  async arrange(): Promise<any> {
    nock.disableNetConnect()
  }
}
