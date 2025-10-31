import * as http from 'node:http'
import {stat} from 'node:fs/promises'
import * as fs from 'node:fs'
import path from 'node:path'
import {createConnectionPool} from '../utils/database.js'

const PORT = 8000
const DB_HOST = 'localhost'
const DB_PORT = '3306'
const DB_USERNAME = 'root'
const DB_PASSWORD = 'Vutuanlinh2002@'
const DB_DATABASE = 'hibernate_demo'

let pool = null;

const requestHandle = async (req , res) => {
  // 1. Health-check API
  if(req.method === 'GET' && req.url === '/health-check'){
    const message = 'The server is fine'

    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(message),
      'Content-Type': 'text/plain; charset=utf-8'
    })

    res.write(message)
    res.end()
  }

  // 2. Get static resources
  if(req.method === 'GET' && req.url.includes('/static/')){
    const fileName = req.url.substring('/static/'.length)
    const filePath = path.join(import.meta.dirname, 'static', fileName)

    try {
      const info = await stat(filePath)

      const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

      let contentType = null;
      switch(fileExtension){
        case '.html':
          contentType = 'text/html; charset=utf-8'
          break
        default:
          contentType = 'text/plain; charset=utf-8'
      }

      res.writeHead(200, {
        'Content-Length': info.size,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Cache-Control': 'no-cache'
      })

      const readStream = fs.createReadStream(filePath)

      readStream.on('data', (chunk) => {
        const canKeepWriting = res.write(chunk)

        if(!canKeepWriting){
          readStream.pause()

          res.once('drain', () => {
            readStream.resume()
          })
        }
      })

      readStream.on('close', () => {
        res.end()
      })

      readStream.on('error', () => {
        if(!res.headersSent){
          res.writeHead(500, {
            'Content-Type': 'text/plain; charset=utf-8'
          })

          res.end('ERROR reading the file')
        }
      })

    } catch(err){
      if(err.code === 'ENOENT'){
        res.writeHead(404, {
          'Content-Type': 'text/plain; charset=utf-8'
        })

        res.end('ERROR file not found')
      } else {
        res.writeHead(500, {
          'Content-Type': 'text/plain; charset=utf-8'
        })

        res.end('Internal server error')
      }
    }
  }

  // 3. Get data from database
  if(req.method === 'GET' && req.url.includes('/api/')){
    const endpoint = req.url.substring('/api/'.length)
    
    switch(endpoint){
      case 'users': 
        const [rows] = await pool.query('SELECT * FROM users')

        const payload = JSON.stringify({data: rows})

        res.writeHead(200, {
          'Content-Length': Buffer.byteLength(payload, 'utf-8'),
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache'
        })

        res.end(payload)
    }
  }

};

async function main(){
  try {
    pool = await createConnectionPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
    })

    const server = http.createServer(requestHandle)

    server.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})
  } catch(err) {
    console.log('Database connection ERROR')
  }
}

main()