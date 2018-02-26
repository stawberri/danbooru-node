const http = require('http')
const https = require('https')
const url = require('url')
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
   * @param {string} [configuration] Connection customization string
   */
  constructor(configuration = 'https://danbooru.donmai.us') {
    if (!/^https?:\/\//.test(configuration))
      configuration = `https://${configuration}@danbooru.donmai.us`

    const booru = new url.URL(configuration)

    const store = storage(this)

    if (booru.protocol === 'https:') store.module = https
    else store.module = http

    store.requestOptions = { protocol: booru.protocol }
    if (booru.hostname) store.requestOptions.hostname = booru.hostname
    if (booru.port) store.requestOptions.port = booru.port

    if (booru.username && booru.password) {
      store.user = booru.username
      store.requestOptions.auth = `${booru.username}:${booru.password}`
    }

    if (!booru.pathname) booru.pathname = '/'
    else booru.pathname = booru.pathname.replace(/\/*$/, '/')
    store.basePath = booru.pathname

    store.url = url.format(booru, {
      auth: false,
      fragment: false,
      search: false
    })
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
   * Calls Node's `request` functions with predefined options merged in
   *
   * All options other than `method`, `path`, and `headers` are discarded.
   *
   * Refer to Node's official documentation at
   * https://nodejs.org/api/http.html#http_http_request_options_callback
   * for more details about how to use this function.
   *
   * @param {Object} options Request options
   * @param {string} [options.method] HTTP request method
   * @param {string} [options.path] Path to be appended to base path
   * @param {Object} [options.headers] Request headers
   * @param {Function} [callback] Response callback
   * @returns {http.ClientRequest} Original stream returned by `request`
   */
  request(options, callback) {
    const { module, requestOptions, basePath } = storage(this)

    let { method, path = '', headers } = options
    path = basePath + path.replace(/^\/+/, '')

    return module.request(
      { method, headers, ...requestOptions, path },
      callback
    )
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
   * * `Danbooru.statusCode` Status code (such as `200` or `404`) that was
   *    returned by the server.
   * * `Danbooru.data` Original string data returned by the server, which
   *    may be useful if there was a parsing error.
   *
   * Rejects native connection errors.
   *
   * @param {string} path Path to be appended to base path
   * @param {Object} [options] Request options
   * @param {string} [options.method] HTTP request method
   * @param {Object} [options.headers] Request headers
   * @param {Object} [options.query] Object to be added to path as query
   * @param {Object} [options.body] Object to be sent as request body
   */
  json(path, options = {}) {
    const { method, headers, query, body } = options

    const reqBody = body && JSON.stringify(body)
    const reqOptions = {
      method,
      path: `${path}.json${util.queryString(query)}`,
      headers: reqBody
        ? { ...headers, 'content-type': 'application/json' }
        : headers
    }

    return new Promise((resolve, reject) => {
      this.request(reqOptions)
        .on('error', reject)
        .on('response', response => {
          let stringData = ''

          response
            .setEncoding('utf8')
            .on('data', chunk => (stringData += chunk))
            .on('end', () => {
              let data
              try {
                data = JSON.parse(stringData)
              } catch (error) {
                data = error
              }

              Object.assign(data, {
                [constants.statusCode]: response.statusCode,
                [constants.data]: stringData
              })

              resolve(data)
            })
        })
        .end(reqBody)
    })
  }
}
