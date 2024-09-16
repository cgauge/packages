import mysql from 'mysql2/promise' 

export const query = async (attributes: {var: string}) => {
  const connection = await mysql.createConnection('localhost')
  const [result] = await connection.execute('SELECT :var', attributes)
  return result
}

export const queryTwo = async (attributes: {var: string}) => {
  const connection = await mysql.createConnection('localhost')
  const [result] = await connection.execute('SELECT :var', attributes)

  const connectionTwo = await mysql.createConnection('localhost')
  await connectionTwo.execute('SELECT :varTwo', attributes)

  return result
}