import * as mysql from 'mysql2/promise'

const HOST = 'localhost'
const PORT = 3306
const USERNAME = 'root'
const PASSWORD = 'vutuanlinh2002'
const DB = 'java'

const main = async () => {
  const pool = mysql.createPool({
    host: HOST,
    port: PORT,
    user: USERNAME,
    password: PASSWORD,
    database: DB
  })

  const conn = await pool.getConnection()

  const response = await conn.query('SELECT 1')

  conn.release()

  console.log(response)
}

main()