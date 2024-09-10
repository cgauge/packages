import mysql from 'mysql2/promise' 

export const query = async (attributes: {var: string}) => {
  const connection = await mysql.createConnection('localhost')
  const [result] = await connection.execute('SELECT :var', attributes)
  return result
}