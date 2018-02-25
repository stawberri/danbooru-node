const http = require('http')
const https = require('https')
const url = require('url')
const storage = require('./weak-map-storage')()

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
    else if (!/\/$/.test(booru.pathname)) booru.pathname += '/'
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
   * Calls Node's `request` functions with predefined options merged in.
   *
   * All options other than `method`, `path`, and `headers` are discarded.
   *
   * Refer to Node's official documentation at
   * https://nodejs.org/api/http.html#http_http_request_options_callback
   * for more details about how to use this function.
   *
   * @param {Object} options Request options
   * @param {string} options.method HTTP request method
   * @param {string} options.path Path to be appended to base path
   * @param {Object} options.headers Request headers
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
}
