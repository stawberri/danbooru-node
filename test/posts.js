const test = require('tape')
const Danbooru = require('..')

test('post fetching', async t => {
  let booru = new Danbooru()
  t.timeoutAfter(30000)

  await Promise.all([
    booru.posts().then(async posts => {
      t.true(Array.isArray(posts), 'returns an array')

      let post = await booru.post(posts[0].id)
      t.equal(post.id, posts[0].id, 'returns individual posts')
    }),
    booru.posts('animal_ears').then(async posts => {
      t.true(posts.every(post => post.tags.includes('animal_ears')), 'searches for tags')

      let post = await booru.post(posts[0])
      t.equal(post.id, posts[0].id, 'can be used instead of ids')
    }),
    booru.posts(['animal ears', '1girl']).then(posts =>
      t.true(posts.every(post => {
        return (
          post.tags.includes('animal_ears') &&
          post.tags.includes('1girl')
        )
      }), 'supports tag arrays')
    ),
    booru.posts('rating:s filesize:..200kb').then(async posts => {
      t.true(posts.every(post => post.rating.s), 'has ratings')

      let post = posts[0]
      let buffer = await post.file.download()
      t.equal(buffer.length, post.file.size, 'downloads correct size file')
    }),
    booru.posts({random: true, page: 3}).then(posts => {
      let file = posts[0].file
      t.equal(typeof file.md5, 'string', 'md5 is a string')
      t.equal(typeof file.width, 'number', 'width is a number')
      t.equal(typeof file.height, 'number', 'height is a number')
      t.equal(typeof file.ext, 'string', 'ext is a string')
      t.equal(typeof file.size, 'number', 'size is a number')
    })
  ]).catch(e => t.error(e))

  t.end()
})
