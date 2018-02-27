# danbooru

danbooru api wrapper

[![npm install danbooru](https://img.shields.io/badge/npm%20install-danbooru-ff69b4.svg?style=for-the-badge)](https://npm.runkit.com/danbooru)
[![npm](https://img.shields.io/npm/v/danbooru.svg?style=for-the-badge)](https://www.npmjs.com/package/danbooru)
[![Travis](https://img.shields.io/travis/stawberri/danbooru-node.svg?style=for-the-badge)](https://travis-ci.org/stawberri/danbooru-node)

```js
const Danbooru = require('danbooru')
const booru = new Danbooru()

booru.posts({ tags: 'rating:safe score:25..' }).then(posts => {
  const index = Math.floor(Math.random() * posts.length)
  const post = posts[index]

  const url = booru.url(post.file_url)
  console.log(url.href)
})
```
