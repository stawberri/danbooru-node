# danbooru-node

danbooru api wrapper

[![npm install danbooru](https://img.shields.io/badge/npm%20install-danbooru-ff69b4.svg)](https://npm.runkit.com/danbooru)
[![npm](https://img.shields.io/npm/v/danbooru.svg)](https://www.npmjs.com/package/danbooru)
[![Travis](https://travis-ci.org/stawberri/danbooru-node.svg?branch=master)](https://travis-ci.org/stawberri/danbooru-node)

This api wrapper allows you to access [Danbooru's API](https://danbooru.donmai.us/wiki_pages?title=help%3Aapi) with functions and promises.

```js
const Danbooru = require('danbooru')

// Perform a search for popular image posts
const booru = new Danbooru()
booru.posts({ tags: 'rating:safe order:rank' }).then(posts => {
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

## Danbooru class

This module exports a `Danbooru` class. Calling its constructor with no argument allows you to make unauthenticated requests to https://danbooru.donmai.us/.

```js
const booru = new Danbooru()
```

If you would like to make authenticated requests, you can pass an authentication string in the format `login:api_key`.

```js
const login = 'login'
const key = 'api_key'
const booru = new Danbooru(login + ':' + key)
```

If you have an alternate Danbooru address you would like to connect to, you also specify that in this string.

```js
const booru = new Danbooru('http://safebooru.donmai.us/')

const login = 'login'
const key = 'api_key'

const authenticatedBooru = new Danbooru(
  `https://${login}:${key}@sonohara.donmai.us`
)
```

## Using this module

Once I've fleshed out this module a bit more, I plan to create more complete documentation for it. For now, here are some things you can do.

### Getting an array of posts

Posts represent images on Danbooru. You can query them like this:

```js
const posts = await booru.posts({ limit: 100 })
```

Your parameters are passed directly to Danbooru's API:

* `limit` - The number of posts you'd like to retrieve on one page.
* `page` - The page number you'd like to retrieve. Bigger numbers have older posts.
* `tags` - Your Danbooru [search tags](https://danbooru.donmai.us/wiki_pages?title=help%3Acheatsheet). You can use two tags unauthenticated, as well as `rating:safe` as a third tag for free.
* `md5` - An image md5 to search for.
* `random` - A boolean that randomizes your results.
* `raw` - Disables tag parsing, treating `tags` as a single literal tag.

You'll get an array of objects that looks like this:
https://danbooru.donmai.us/posts.json

### Getting a single post by its id

You can also look up a single post using the same function:

```js
const post = await booru.posts(2560676)
```

You'll get an object: https://danbooru.donmai.us/posts/2560676.json

### Getting an image

Once you have a post, you'll likely want to extract its image. The most useful object properties for this purpose are:

* `file_url`: The image you get by default when you manually browse on Danbooru.
* `large_file_url`: The full size version of the image. Might be the same as `file_url`.
* `preview_file_url`: The tiny thumbnail used to represent this image.

You can pass one of these values to `booru.url()` to generate a `URL` object, which you can turn into an absolute url by accessing `url.href` or just typecasting it.

```js
const post = await booru.posts(2560676)
const url = booru.url(post.file_url)

// Node.js
const request = http.get(url.href)

// Browsers
const response = await fetch(url)
```

### Manipulating favorites

Previous versions of this library have had functions to manipulate favorites for an authenticated user, so you can still do that with this version.

```js
// Add a favorite
booru.favorites_create(2560676)

// Remove a favorite
booru.favorites_destroy(2560676)
```

### Other endpoints

If you would like to do something I haven't added to this module yet, you can use these methods:

```js
booru.get('/posts', queryStringParams)
booru.post('/favorites', bodyParams)
booru.put('/posts/2560676', bodyParams)
booru.delete('/favorites/2560676', bodyParams)
```

They all take two arguments. The first is a path, and the second is your parameters. They'll be sent as JSON for `POST`, `PUT`, and `DELETE` requests, and as part of a query string for `GET` requests.

Your paths' leading slashes are optional, but don't add extensions or query strings. These functions will automatically add `.json` and any specified query string properties to the end.

## Upgrading from previous versions

If you prefer older versions of this module, you can still install them with one of these commands, and find documentation for them on GitHub.

* [danbooru-node v2.0.3](https://github.com/stawberri/danbooru-node/tree/v2.0.3): `npm install danbooru@2`
* [danbooru-node v1.4.8](https://github.com/stawberri/danbooru-node/tree/v1.4.8): `npm install danbooru@1`
