import net from 'node:net'

export type WriteCallback = (error?: Error | null) => void

export type WriteArgs =
  | [chunk: unknown, callback?: WriteCallback]
  | [chunk: unknown, encoding: BufferEncoding, callback?: WriteCallback]

export type NormalizedSocketWriteArgs = [
  chunk: any,
  encoding?: BufferEncoding,
  callback?: WriteCallback,
]

export function normalizeSocketWriteArgs(
  args: WriteArgs
): NormalizedSocketWriteArgs {
  const normalized: NormalizedSocketWriteArgs = [args[0], undefined, undefined]

  if (typeof args[1] === 'string') {
    normalized[1] = args[1]
  } else if (typeof args[1] === 'function') {
    normalized[2] = args[1]
  }

  if (typeof args[2] === 'function') {
    normalized[2] = args[2]
  }

  return normalized
}

export interface MockSocketOptions {
  write: (
    socket: net.Socket,
    chunk: Buffer | string
  ) => void
}

export class MockSocket extends net.Socket {
  public connecting: boolean

  constructor(protected readonly options: MockSocketOptions) {
    super()
    this.connecting = false
    this.connect()

    this._final = (callback) => {
      callback(null)
    }
  }

  public connect() {
    return this
  }

  public write(...args: Array<unknown>): boolean {
    const [chunk] = normalizeSocketWriteArgs(
      args as WriteArgs
    )
    this.options.write(this, chunk)
    return true
  }

  public end(...args: Array<unknown>) {
    const [chunk] = normalizeSocketWriteArgs(
      args as WriteArgs
    )
    this.options.write(this, chunk)
    return super.end.apply(this, args as any)
  }
}