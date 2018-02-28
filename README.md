# danbooru-node

danbooru api wrapper

[![npm install danbooru](https://img.shields.io/badge/npm%20install-danbooru-ff69b4.svg)](https://npm.runkit.com/danbooru)
[![npm](https://img.shields.io/npm/v/danbooru.svg)](https://www.npmjs.com/package/danbooru)
[![Travis](https://travis-ci.org/stawberri/danbooru-node.svg?branch=master)](https://travis-ci.org/stawberri/danbooru-node)

This api wrapper allows you to access [Danbooru's API](https://danbooru.donmai.us/wiki_pages?title=help%3Aapi) with functions and promises.

```js
const Danbooru = require('danbooru')
const booru = new Danbooru()

// Perform a search for popular image posts
booru.posts({ tags: 'rating:safe order:rank', limit: 100 }).then(posts => {
  // Select a random post from posts array
  const index = Math.floor(Math.random() * posts.length)
  const post = posts[index]

  // Get post's url and create a filename for it
  const url = booru.url(post.file_url)
  const name = `${post.md5}.${post.file_ext}`

  // Download post image using node's https and fs libraries
  require('https').get(url, response => {
    response.pipe(require('fs').createWriteStream(name))
  })
})
```
