const { http, https, URL, btoa, fetch } = require('./requires')
const storage = require('./weak-map-storage')()
const constants = require('./constants')
const util = require('./util')

module.exports = class Booru {
  /**
   * Create a new Danbooru API wrapper
   *
   * Optionally specify an alternate url or login details:
   * - `login:api_key`
   * - `http://safebooru.donmai.us`
   * - `https://login:api_key@sonohara.donmai.us`
   *
   * @param {string} [configuration] Connection customization string
   */
  constructor(configuration = 'https://danbooru.donmai.us') {
    if (!/^https?:\/\//.test(configuration))
      configuration = `https://${configuration}@danbooru.donmai.us`

    const booru = new URL(configuration)

    const store = storage(this)

    if (booru.protocol === 'https:') store.module = https
    else store.module = http

    store.protocol = booru.protocol
    if (booru.hostname) store.hostname = booru.hostname
    if (booru.port) store.port = booru.port

    if (booru.username && booru.password) {
      store.auth = `${booru.username}:${booru.password}`
      Object.defineProperty(this, 'user', { value: booru.username })
    }

    if (!booru.pathname) booru.pathname = '/'
    else booru.pathname = booru.pathname.replace(/\/*$/, '/')
    store.basePath = booru.pathname

    booru.username = ''
    booru.password = ''
    booru.hash = ''
    booru.search = ''
    Object.defineProperty(this, 'url', { value: `${booru}` })
  }

  /**
   * Perform a web request
   *
   * May use 'request' or 'fetch', indicated by the first element in array
   *
   * @param {Object} [options] Request options
   * @param {string} [options.method] HTTP request method
   * @param {string} [options.path] Path to be appended to base path
   * @param {Object} [options.headers] Request headers
   * @param {*} [options.body] Request body
   * @returns {Array} Function used, followed by return value
   */
  request(options = {}) {
    const { module, protocol, hostname, port, auth, basePath } = storage(this)

    const { method, body } = options
    let { path = '', headers = {} } = options
    path = basePath + path.replace(/^\/+/, '')
    if (auth) headers = { ...headers, authorization: `Basic ${btoa(auth)}` }

    if (module) {
      const request = module.request({
        protocol,
        hostname,
        port,
        method,
        headers,
        path
      })

      if (body) request.end(body)
      else request.end()

      return ['request', request]
    } else {
      return ['fetch', fetch()]
    }
  }

  /**
   * Perform a request and receive an object
   *
   * Only works with `application/json` data, and automatically appends `.json`
   * to paths.
   *
   * Rejects on connection errors and resolves data object or parsing error.
   * Returned objects have extra symbol key values:
   * * `Danbooru.status` Status code from server
   * * `Danbooru.data` Original string data
   * * `Danbooru.headers` Response headers
   *
   * @param {string} path Path to be appended to base path
   * @param {Object} [options] Request options
   * @param {string} [options.method] HTTP request method
   * @param {Object} [options.headers] Request headers
   * @param {Object | Array} [options.query] Data to be added to path
   * @param {Object | Array} [options.body] Data to be sent as request body
   * @returns {Promise} Resolves to a json object or a parsing error
   */
  json(path, options = {}) {
    return new Promise((resolve, reject) => {
      const { method, query, body } = options
      let { headers = {} } = options

      const reqBody = body && JSON.stringify(body)
      if (reqBody) headers = { ...headers, 'content-type': 'application/json' }
      const reqOptions = {
        method,
        headers,
        path: `${path}.json${util.queryString(query)}`,
        body: reqBody
      }

      const [reqType, reqValue] = this.request(reqOptions)

      switch (reqType) {
        case 'request':
          reqValue.on('error', reject).on('response', response => {
            let data = ''
            const { statusCode: status, headers } = response

            response
              .setEncoding('utf8')
              .on('data', chunk => (data += chunk))
              .on('end', () => resolve({ data, status, headers }))
          })

          break
        case 'fetch':
          reqValue.then(async response => {
            const { status, headers } = response
            const data = await response.text()
            resolve({ data, status, headers })
          }, reject)

          break
      }
    }).then(response => {
      let data
      try {
        data = JSON.parse(response.data)
      } catch (error) {
        data = error
      }

      Object.assign(data, {
        [constants.status]: response.status,
        [constants.data]: response.data,
        [constants.headers]: response.headers
      })

      return data
    })
  }

  /**
   * Perform a json GET request
   *
   * @param {string} path Resource path
   * @param {Object | Array} [query] Query string data
   * @returns {Promise} Resolves to server response data
   */
  get(path, query) {
    return this.json(path, { query })
  }

  /**
   * Perform a json POST request
   *
   * @param {string} path Resource path
   * @param {Object | Array} [body] Request body data
   * @returns {Promise} Resolves to server response data
   */
  post(path, body) {
    return this.json(path, { method: 'POST', body })
  }

  /**
   * Perform a json PUT request
   *
   * @param {string} path Resource path
   * @param {Object | Array} [body] Request body data
   * @returns {Promise} Resolves to server response data
   */
  put(path, body) {
    return this.json(path, { method: 'PUT', body })
  }

  /**
   * Perform a json DELETE request
   *
   * @param {string} path Resource path
   * @param {Object | Array} [body] Request body data
   * @returns {Promise} Resolves to server response data
   */
  delete(path, body) {
    return this.json(path, { method: 'DELETE', body })
  }
}
