import nock from 'nock'

export const  arrange = async (): Promise<boolean> => {
  nock.disableNetConnect()
  return true
} 
