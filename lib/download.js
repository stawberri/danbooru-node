const util = require('./util')
const Events = require('events')
const error = require('./error')

exports = module.exports = class Download {
  constructor(booru, path) {
    if(!path) throw new TypeError('no path provided')
    Object.assign(util.$(this), {booru, path})
  }

  get name() {
    let {path} = util.$(this)
    return path.match(/[^\/]+$/)[0]
  }

  get ext() {
    let {path} = util.$(this)
    return path.match(/\.([^\.\/\\?#]+)([?#].*)?$/)[1]
  }

  request() {
    let {booru, path} = util.$(this)
    return booru.request({path})
  }

  download() {
    let events = new Events()
    events.disable = function() {
      this.disabled = true
      this.removeAllListeners()
    }

    let promise = new Promise((resolve, reject) => {
      let request
      this.request().then(response => {
        if(!events.disabled) {
          events.on('abort', () => {
            abortRequest(
              new error.UserInitiatedError('download aborted by user')
            )
          })
          if(events.aborted) events.emit('abort')
        }

        let lastData = [0, +response.headers['content-length']]
        let buffer = Buffer.alloc(lastData[1])

        response.on('data', chunk => {
          lastData[0] += chunk.copy(buffer, lastData[0])
          events.emit('data', ...lastData)
        })
        response.on('end', () => {
          events.disable()
          resolve(buffer)
        })

        function abortRequest(err) {
          response.destroy()
          events.disable()
          reject(err)
        }
      })
    })
    promise.data = listener => {
      if(events.disabled) return
      events.on('data', listener)
      return promise
    }
    promise.abort = () => {
      events.aborted = true
      events.emit('abort')
      return promise
    }
    return promise
  }
}
