const Booru = require('../booru')

module.exports = class extends Booru {
  /**
   * favorites#index
   *
   * @param {Object} params Listing params
   * @returns {Promise} Resolves to server response
   */
  favorites(params = {}) {
    return this.get('favorites', params)
  }

  /**
   * favorites#create
   *
   * @param {Object} params Favorite params
   * @returns {Promise} Resolves to server response
   */
  favorites_create(params) {
    return this.post('favorites', params)
  }

  /**
   * favorites#destroy
   *
   * @param {*} id Post id
   * @returns {Promise} Resolves to server response
   */
  favorites_destroy(id) {
    return this.delete(`favorites/${id}`)
  }
}
