import {Socket} from 'node:net'
import {Buffer} from 'node:buffer'

export type WriteCallback = (error?: Error) => void

export interface MockSocketOptions {
  write: (socket: Socket, chunk: string | Buffer) => void
}

export class MockSocket extends Socket {
  constructor(private readonly options: MockSocketOptions) {
    super()
  }

  override write(buffer: string | Buffer, cb?: WriteCallback): boolean
  override write(buffer: string | Buffer, encoding?: BufferEncoding, cb?: WriteCallback): boolean
  override write(buffer: string | Buffer, encodingOrCb?: BufferEncoding | WriteCallback, cb?: WriteCallback): boolean {
    const callback = typeof encodingOrCb === 'function' ? encodingOrCb : cb
    this.options.write(this, buffer)

    if (callback) {
      callback()
    }

    return true
  }
}
