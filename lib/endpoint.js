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
   * @param {string} [endpoint] Your desired Danbooru API endpoint
   */
  constructor(endpoint = 'https://danbooru.donmai.us') {
    if (!/^https?:\/\//.test(endpoint))
      endpoint = `https://${endpoint}@danbooru.donmai.us`

    endpoint = new url.URL(endpoint)

    const info = storage(this)

    const { username, password } = endpoint
    if (username && password) {
      info.user = username
      info.auth = `${username}:${password}`
    }

    info.url = url.format(endpoint, {
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
}
