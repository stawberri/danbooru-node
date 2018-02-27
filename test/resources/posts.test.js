const Danbooru = require('../..')
const nock = require('nock')

beforeEach(() => nock.cleanAll())

test('listing', async () => {
  const params = { limit: 97, tags: 'override gorgeous' }
  const reply = { quantifying: 'magenta azure approach' }

  const scope = nock('https://danbooru.donmai.us')
    .get('/posts.json')
    .query(params)
    .reply(200, reply)

  const result = await new Danbooru().posts(params)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('show', async () => {
  const id = 43561
  const reply = { blue: 'Turks and Islands invoice HTTP' }

  const scope = nock('https://danbooru.donmai.us')
    .get(`/posts/${id}.json`)
    .reply(200, reply)

  const result = await new Danbooru().posts(id)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('update', async () => {
  const id = 88558
  const post = { feed: 'Central African Republic Steel Licensed' }
  const reply = { seize: 'Gorgeous Rubber Pizza Arkansas' }

  const scope = nock('https://danbooru.donmai.us')
    .put(`/posts/${id}.json`, { post })
    .reply(200, reply)

  const result = await new Danbooru().postsUpdate(id, post)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('revert', async () => {
  const id = 5423
  const version_id = 60046
  const reply = { override: 'Checking Account payment' }

  const scope = nock('https://danbooru.donmai.us')
    .put(`/posts/${id}/revert.json`, { version_id })
    .reply(200, reply)

  const result = await new Danbooru().postsRevert(id, version_id)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('copy notes', async () => {
  const id = 31577
  const other_post_id = 78306
  const reply = { innovate: 'multi-byte Shirt Gateway Pike' }

  const scope = nock('https://danbooru.donmai.us')
    .put(`/posts/${id}/copy_notes.json`, { other_post_id })
    .reply(200, reply)

  const result = await new Danbooru().postsCopyNotes(id, other_post_id)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('mark as translated', async () => {
  const id = 66421
  const post = { program: 'networks Right-sized collaborative' }
  const reply = { bypass: 'Money Market Account' }

  const scope = nock('https://danbooru.donmai.us')
    .put(`/posts/${id}/mark_as_translated.json`, { post })
    .reply(200, reply)

  const result = await new Danbooru().postsMarkAsTranslated(id, post)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('vote', async () => {
  const id = 98217
  const score = 'up'
  const reply = { withdrawal: 'Investment Account Niger' }

  const scope = nock('https://danbooru.donmai.us')
    .post(`/posts/${id}/votes.json`, { score })
    .reply(200, reply)

  const result = await new Danbooru().postsVote(id, score)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('unvote', async () => {
  const id = 54882
  const reply = { relationships: 'next-generation Avon' }

  const scope = nock('https://danbooru.donmai.us')
    .delete(`/posts/${id}/votes.json`)
    .reply(200, reply)

  const result = await new Danbooru().postsUnvote(id)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})
