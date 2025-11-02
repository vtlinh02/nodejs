export const readJsonBody = (req) => {

  return new Promise((resolve, reject) => {
    if(req.headers['content-type'] !== 'application/json'){
      reject({
        'message': 'Can only handle JSON payload',
        'status': 'failed'
      })
    }

    let chunkList = []
    let payloadRaw = null

    req.on('data', (chunk) => {
      chunkList.push(chunk)
    })

    req.on('end', () => {
      payloadRaw = Buffer.concat(chunkList).toString('utf-8')

      let payload = JSON.parse(payloadRaw)

      resolve({
        'data': payload,
        'message': 'successed'
      })
    })

    req.on('aborted', () => {
      reject({
        'status': 'failed',
        'message': 'Client aborted midway'
      })
    })

    req.on('error', () => {
      reject({
        'status': 'failed',
        'message': 'Reading request fail'
      })
    })
  })
}

// can async/await replaced Promise ??? => I don't think async/await can work with event-driven case, only Promise can help