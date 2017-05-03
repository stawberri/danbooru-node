const test = require('tape')
const Danbooru = require('..')

test('post fetching', async t => {
  let booru = new Danbooru()
  t.timeoutAfter(30000)

  let posts = await booru.posts('animal_ears')
  t.true(Array.isArray(posts), 'returns an array')
  t.true(posts.every(post => post.tags.includes('animal_ears')), 'searches for tags')

  let post = await booru.post(posts[0].id)
  t.deepEqual(post.raw, posts[0].raw, 'returns individual posts')

  t.end()
})
