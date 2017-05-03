const test = require('tape')
const Danbooru = require('..')

test('post fetching', async t => {
  let booru = new Danbooru()
  t.timeoutAfter(30000)

  await Promise.all([
    booru.posts().then(async posts => {
      t.true(Array.isArray(posts), 'returns an array')

      let post = await booru.post(posts[0].id)
      t.equal(post.raw.id, posts[0].raw.id, 'returns individual posts')
    }),
    booru.posts('animal_ears').then(async posts => {
      t.true(posts.every(post => post.tags.includes('animal_ears')), 'searches for tags')

      let post = await booru.post(posts[0])
      t.deepEqual(post.raw, posts[0].raw, 'can be used instead of ids')
    }),
    booru.posts(['animal ears', '1girl']).then(posts =>
      t.true(posts.every(post => {
        return (
          post.tags.includes('animal_ears') &&
          post.tags.includes('1girl')
        )
      }), 'supports tag arrays')
    ),
    booru.posts('rating:s').then(posts => {
      t.true(posts.every(post => post.rating.s), 'has ratings')
    })
  ])

  t.end()
})
