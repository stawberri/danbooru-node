const http = require('http')
const https = require('https')
const url = require('url')
const storage = require('./weak-map-storage')()

module.exports = class Endpoint {
  /**
   * Create a new Danbooru API wrapper
   *
   * You can optionally specify a string to customize how you will connect to
   * Danbooru, in one of the following formats:
   * - *undefined* - Use https://danbooru.donmai.us/ unauthenticated
   * - `login:api_key` - Use https://danbooru.donmai.us/ with your credentials
   * - `https://safebooru.donmai.us` - Use your url unauthenticated.
   * - `http://login:api_key@sonohara.donmai.us` - Use your url with credentials
   *
   * @param {string} [configuration] Your desired Danbooru API endpoint
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
   * Calls `http.request()` (or `https`'s version) with url and credentials
   *
   * @see https://nodejs.org/api/http.html#http_http_request_options_callback
   *
   * @param {Object} options Request options
   * @param {Function} [callback] Response callback
   * @returns {http.ClientRequest} Writable stream as returned by `request()`
   */
  request(options, callback) {
    const { module, requestOptions, basePath } = storage(this)

    let { path = '' } = options
    path = basePath + path.replace(/^\/+/, '')

    options = { ...options, ...requestOptions, path }
    return module.request(options, callback)
  }
}
