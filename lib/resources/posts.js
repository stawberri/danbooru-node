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

  /**
   * Update a post
   *
   * @param {*} id Post id
   * @param {Object} post Post params
   * @returns {Promise} Resolves to server response
   */
  postsUpdate(id, post) {
    return this.put(`/posts/${id}`, { post })
  }

  /**
   * Revert a post
   *
   * @param {*} id Post id
   * @param {*} version_id Version id
   * @returns {Promise} Resolves to server response
   */
  postsRevert(id, version_id) {
    return this.put(`/posts/${id}/revert`, { version_id })
  }

  /**
   * Copy notes from another post
   *
   * @param {*} id Post id
   * @param {*} other_post_id Other post id
   * @returns {Promise} Resolves to server response
   */
  postsCopyNotes(id, other_post_id) {
    return this.put(`/posts/${id}/copy_notes`, { other_post_id })
  }

  /**
   * Mark post translation
   *
   * @param {*} id Post id
   * @param {Object} post Translation information
   * @returns {Promise} Resolves to server response
   */
  postsMarkAsTranslated(id, post) {
    return this.put(`/posts/${id}/mark_as_translated`, { post })
  }

  /**
   * Vote on a post
   *
   * @param {*} id Post id
   * @param {string} score `up` or `down`
   * @returns {Promise} Resolves to server response
   */
  postsVote(id, score) {
    return this.post(`/posts/${id}/votes`, { score })
  }

  /**
   * Delete post vote
   *
   * @param {*} id Post id
   * @returns {Promise} Resolves to server response
   */
  postsUnvote(id) {
    return this.delete(`/posts/${id}/votes`)
  }
}
