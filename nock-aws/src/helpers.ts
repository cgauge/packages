import nodeAssert from 'node:assert/strict'
import extraAssert from '@cgauge/assert'
import nock from 'nock'

export const checkForPendingMocks = (): void => {
  if (!nock.isDone()) {
    const error = nock.pendingMocks()
    console.log(error)
    nock.cleanAll()
    throw new Error('Not all nock interceptors were used!')
  }
}

export const partialBodyCheck = (expected: string | Record<string, unknown>) => (body: Record<string, unknown>) => {
  if (typeof expected === 'string') {
    nodeAssert.equal(body, expected)
    return true
  }

  extraAssert.objectContains(body, expected)
  return true
}

const xmlToInline = (xml: string): string =>
  xml
    .replace(/\r?\n|\r/g, '')
    .replace(/>\s+</g, '><')
    .trim()

export const partialXmlBodyCheck = (expected: string) => (body: string) => {
  nodeAssert.equal(xmlToInline(body), xmlToInline(expected))

  return true
}
