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
    tags.artist = this.raw.tag_string_artist.split(' ')
    tags.character = this.raw.tag_string_character.split(' ')
    tags.copyright = this.raw.tag_string_copyright.split(' ')
    tags.general = this.raw.tag_string_general.split(' ')
    return tags
  }

  get rating() {
    return new Rating(this.raw.rating)
  }

  get file() {
    let {booru} = util.$(this)
    let file = new Download(booru, this.raw.file_url)

    Object.assign(file, {
      md5: this.raw.md5,
      width: this.raw.image_width,
      height: this.raw.image_height,
      ext: this.raw.file_ext,
      size: this.raw.file_size
    })

    return file
  }
}
