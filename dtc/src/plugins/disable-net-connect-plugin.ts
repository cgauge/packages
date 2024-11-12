import nock from 'nock'

export const arrange = () => {
  nock.disableNetConnect()
} 
