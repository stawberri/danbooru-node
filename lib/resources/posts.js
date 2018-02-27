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

  postsUpdate(id, post) {
    return this.put(`/posts/${id}`, { post })
  }

  postsRevert(id, version_id) {
    return this.put(`/posts/${id}/revert`, { version_id })
  }

  postsCopyNotes(id, other_post_id) {
    return this.put(`/posts/${id}/copy_notes`, { other_post_id })
  }

  postsMarkAsTranslated(id, post) {
    return this.put(`/posts/${id}/mark_as_translated`, { post })
  }

  postsVote(id, score) {
    return this.post(`/posts/${id}/votes`, { score })
  }

  postsUnvote(id) {
    return this.delete(`/posts/${id}/votes`)
  }
}
