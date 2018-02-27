const Booru = require('../booru')

module.exports = class extends Booru {
  /**
   * Get post listing or a single post
   *
   * @param {Object | *} [paramsOrId] Listing params or show id
   * @returns {Promise} Resolves to a data array or object
   */
  posts(paramsOrId = {}) {
    if (new Object(paramsOrId) === paramsOrId)
      return this.get('/posts', paramsOrId)
    return this.get(`/posts/${paramsOrId}`)
  }
}
