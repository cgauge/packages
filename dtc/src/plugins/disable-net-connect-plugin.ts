import nock from 'nock'

export const arrange = (): boolean => {
  nock.disableNetConnect()
  return true
} 
