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
