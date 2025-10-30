import * as http from 'node:http'
import {stat} from 'node:fs/promises'
import * as fs from 'node:fs'
import path from 'node:path'

const PORT = 8000

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
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`
      })

      const readStream = fs.createReadStream(filePath)
      readStream.pipe(res)

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

};

const server = http.createServer(requestHandle)

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
})