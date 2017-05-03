exports = module.exports = class Post {
  constructor(booru, data) {
    let $this = $(this)
    $this.booru = booru
    this.raw = Object.freeze(Object.assign({}, data))
  }

  get id() { return this.raw.id }
  toString() { return this.id + '' }
  valueOf() { return +this.id }

  get tags() {
    return memo(this, 'tags', () => {
      let tags = this.raw.tag_string.split(' ')

      tags.artist = this.raw.tag_string_artist.split(' ')
      Object.freeze(tags.artist)

      tags.character = this.raw.tag_string_character.split(' ')
      Object.freeze(tags.character)

      tags.copyright = this.raw.tag_string_copyright.split(' ')
      Object.freeze(tags.copyright)

      tags.general = this.raw.tag_string_general.split(' ')
      Object.freeze(tags.general)

      return Object.freeze(tags)
    })
  }
}

const intern = new WeakMap()
function $(post) {
  if(!intern.has(post)) intern.set(post, {})
  return intern.get(post)
}

function memo(post, property, fn) {
  let $post = $(post)
  if(property in $post) return $post[property]
  else return $post[property] = fn()
}
