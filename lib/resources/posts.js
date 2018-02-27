const Booru = require('../booru')

module.exports = class extends Booru {
  posts(arg = {}) {
    if (new Object(arg) === arg) return this.get('/posts', arg)
    else return this.get(`/posts/${arg}`)
  }
}
