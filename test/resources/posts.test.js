const Danbooru = require('../..')
const nock = require('nock')

afterEach(() => nock.cleanAll())

test('listing', async () => {
  const params = { limit: 97, tags: 'override gorgeous' }
  const reply = { quantifying: 'magenta azure approach' }

  const scope = nock('https://danbooru.donmai.us')
    .get('/posts.json')
    .query(params)
    .reply(200, reply)

  const booru = new Danbooru()
  expect(await booru.posts(params)).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('show', async () => {
  const id = 43561
  const reply = { blue: 'Turks and Islands invoice HTTP' }

  const scope = nock('https://danbooru.donmai.us')
    .get(`/posts/${id}.json`)
    .reply(200, reply)

  const booru = new Danbooru()
  expect(await booru.posts(id)).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})
