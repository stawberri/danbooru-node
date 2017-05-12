const Rating = require('./rating')
const Download = require('./download')
const util = require('./util')

exports = module.exports = class Post {
  constructor(booru, data) {
    let $this = util.$(this, {booru})
    this.raw = Object.assign({}, data)
  }

  get id() { return this.raw.id }
  toString() { return this.id + '' }
  valueOf() { return +this.id }

  get tags() {
    let tags = this.raw.tag_string.split(' ')
    tags.artist = arrayify(this.raw.tag_string_artist)
    tags.character = arrayify(this.raw.tag_string_character)
    tags.copyright = arrayify(this.raw.tag_string_copyright)
    tags.general = arrayify(this.raw.tag_string_general)
    return tags

    function arrayify(subtags) {
      subtags = subtags.split(' ')
      if(subtags.length === 1 && subtags[0] === '') subtags = []
      return subtags
    }
  }

  get rating() {
    let rating = new Rating(this.raw.rating)
    rating.locked = !!this.raw.is_rating_locked
    return rating
  }

  get file() {
    let file = {}
    let {booru} = util.$(this)

    if(this.raw.file_url)
      file = new Download(booru, this.raw.file_url)
    if(this.raw.preview_file_url)
      file.preview = new Download(booru, this.raw.preview_file_url)
    if(this.raw.large_file_url !== this.raw.file_url)
      file.large = new Download(booru, this.raw.large_file_url)

    if(this.raw.image_width) file.width = this.raw.image_width
    if(this.raw.image_height) file.height = this.raw.image_height
    if(this.raw.md5) file.md5 = this.raw.md5
    if(this.raw.file_size) file.size = this.raw.file_size

    return file
  }
}

exports.ify = (booru, posts) => {
  if(Object(posts) !== posts)
    throw new TypeError('posts must be an object or array')
  if(!Array.isArray(posts))
    return new exports(booru, posts)
  else {
    return posts.map(post => new exports(booru, post))
  }
}

exports.id = (post) => {
  if(Object(post) === post) {
    if(post instanceof exports) return post.id
    else throw new TypeError('object provided is not a post')
  } else {
    switch(typeof post) {
      case 'number': return post
      case 'string': return +post
      default: throw new TypeError('value provided is not a valid id')
    }
  }
}
