import * as mysql from 'mysql2/promise'

export const createConnectionPool = async (config) => {
  const pool = mysql.createPool(config)

  let testConnection = null;
  try {
    testConnection = await pool.getConnection()

    return pool
  } catch(err) {
    throw(err)

  } finally {
    if(testConnection){
      testConnection.release()
    }
  }
}