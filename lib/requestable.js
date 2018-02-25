const storage = require('./weak-map-storage')()

module.exports = class Requestable {
  /**
   * Create a new Danbooru API wrapper
   *
   * You can provide options to this constructor. Specify `name` and `key` if
   * you would like your API requests to be authenticated, and `url` if you
   * would like to connect to Danbooru at an alternate URL.
   *
   * @param {Object} [options] - Information about how to connect to Danbooru
   * @param {string} [options.name] - Your Danbooru user name, used to log in
   * @param {string} [options.key] - Your Danbooru API key, found on your profile
   * @param {string} [options.url] - The url you would like to connect to Danbooru with
   */
  constructor(options = {}) {
    const { name, key, url } = options

    const info = storage(this)
    if (name && key) info.auth = `${name}:${key}`
    info.url = url || 'https://danbooru.donmai.us/'
  }
}
