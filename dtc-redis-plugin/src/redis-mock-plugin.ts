import net, {Socket} from 'node:net'
import {MockSocket} from './socket-mock'

const REDIS_PORT = 6379
const data: Record<string, string> = {}
type MockRedis = {
  command: string
  key: string
  value: string
}

const write = (socket: net.Socket, chunk: Buffer | string) => {
  const args = chunk.toString().split('\r\n')
  const command = args[2]?.toLowerCase()

  if (command === 'get') {
    const value = data[args[4]]
    socket.push(value !== undefined ? `$${value.length}\r\n${value}\r\n` : `$-1\r\n`)
    return
  }

  socket.push('+OK\r\n')
}

function isRedisMockArgs(arg: unknown): arg is {redis: MockRedis[]} {
  return typeof arg === 'object' && arg !== null && 'redis' in arg
}

export const arrange = async (args: unknown): Promise<boolean> => {
  if (!isRedisMockArgs(args)) {
    return false
  }

  for (const redisFixture of args.redis) {
    if (redisFixture.command === 'set') {
      data[redisFixture.key] = redisFixture.value
    }
  }

  const originalCreateConnection = net.createConnection.bind(net)
  net.createConnection = (connectionInfo: any, host?: any, callback?: any): Socket => {
    if (connectionInfo.port === REDIS_PORT) {
      return new MockSocket({write})
    }

    return originalCreateConnection(connectionInfo, host, callback)
  }

  return true
}
