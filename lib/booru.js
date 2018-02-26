const { http, https, URL, btoa, fetch } = require('./requires')
const storage = require('./weak-map-storage')()
const constants = require('./constants')
const util = require('./util')

module.exports = class Booru {
  /**
   * Create a new Danbooru API wrapper
   *
   * You can optionally specify a string to customize how you will connect to
   * Danbooru, in one of the following formats:
   * - *undefined* Use https://danbooru.donmai.us/ unauthenticated
   * - `login:api_key` Use https://danbooru.donmai.us/ with your credentials
   * - `https://safebooru.donmai.us` Use your url unauthenticated.
   * - `https://login:api_key@sonohara.donmai.us` Use your url with credentials
   *
   * Both `http` and `https` urls are supported.
   *
   * Any value that doesn't start with `http://` or `https://` will be treated
   * as login credentials, even if they are invalid.
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
      store.user = booru.username
      store.auth = `${booru.username}:${booru.password}`
    }

    if (!booru.pathname) booru.pathname = '/'
    else booru.pathname = booru.pathname.replace(/\/*$/, '/')
    store.basePath = booru.pathname

    const cleanUrl = new URL(booru)
    cleanUrl.username = ''
    cleanUrl.password = ''
    cleanUrl.hash = ''
    cleanUrl.search = ''
    store.url = `${cleanUrl}`
  }

  /**
   * Get associated username
   * @returns {string} Associated username
   */
  get user() {
    return storage(this).user
  }

  /**
   * Get associated URL
   * @returns {string} Associated url
   */
  get url() {
    return storage(this).url
  }

  /**
   * Performs a web request
   *
   * Internally, this function may use either `request` or `fetch` depending on
   * what is available. It returns an array where the first element indicates
   * which was used, and the second element is its return value.
   *
   * @param {Object} [options] Request options
   * @param {string} [options.method] HTTP request method
   * @param {string} [options.path] Path to be appended to base path
   * @param {Object} [options.headers] Request headers
   * @param {*} [options.body] Request body
   * @returns {Array} A string indicating the internal function used, followed
   *   by its return value
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
   * Don't include a file extension in `path`, because `.json` will be appended
   * to the end automatically.
   *
   * This function always sends bodies as `application/json` and assumes that
   * it will receive a json string response.
   *
   * Resolves an object if response could be parsed successfully, or an `Error`
   * if it could not. Regardless, the resolved object or error will have a few
   * extra values, accessible through symbol keys:
   * * `Danbooru.status` Status code (such as `200` or `404`) that was returned
   *    by the server.
   * * `Danbooru.data` Original string data returned by the server, which
   *    may be useful if there was a parsing error.
   * * `Danbooru.headers` Headers returned by the server
   *
   * Rejects native connection errors.
   *
   * @param {string} path Path to be appended to base path
   * @param {Object} [options] Request options
   * @param {string} [options.method] HTTP request method
   * @param {Object} [options.headers] Request headers
   * @param {Object|[]*} [options.query] Data to be added to path
   * @param {Object|[]*} [options.body] Data to be sent as request body
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
   * Uses `json` internally, so more details are available there
   *
   * @see json
   *
   * @param {string} path Resource path
   * @param {Object|[]*} query Query string data
   * @returns {Promise} Server response data
   */
  get(path, query) {
    return this.json(path, { query })
  }

  /**
   * Perform a json POST request
   *
   * Uses `json` internally, so more details are available there
   *
   * @see json
   *
   * @param {string} path Resource path
   * @param {Object|[]*} body Request body data
   * @returns {Promise} Server response data
   */
  post(path, body) {
    return this.json(path, { method: 'POST', body })
  }

  /**
   * Perform a json PUT request
   *
   * Uses `json` internally, so more details are available there
   *
   * @see json
   *
   * @param {string} path Resource path
   * @param {Object|[]*} body Request body data
   * @returns {Promise} Server response data
   */
  put(path, body) {
    return this.json(path, { method: 'PUT', body })
  }

  /**
   * Perform a json DELETE request
   *
   * Uses `json` internally, so more details are available there
   *
   * @see json
   *
   * @param {string} path Resource path
   * @param {Object|[]*} body Request body data
   * @returns {Promise} Server response data
   */
  delete(path, body) {
    return this.json(path, { method: 'DELETE', body })
  }
}
