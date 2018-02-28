const Danbooru = require('../..')
const nock = require('nock')

beforeEach(() => nock.cleanAll())

test('favorites#index', async () => {
  const params = { functionalities: 'Auto Loan Account' }
  const reply = { input: 'middleware executive Granite' }

  const scope = nock('https://danbooru.donmai.us')
    .get('/favorites.json')
    .query(params)
    .reply(200, reply)

  const result = await new Danbooru().favorites(params)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('favorites#create', async () => {
  const post_id = 1799
  const reply = { magenta: 'payment programming override' }

  const scope = nock('https://danbooru.donmai.us')
    .post('/favorites.json', { post_id })
    .reply(200, reply)

  const result = await new Danbooru().favorites_create(post_id)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('favorites#destroy', async () => {
  const id = 84796
  const reply = { deposit: 'hard drive blue bypass mesh Bacon' }

  const scope = nock('https://danbooru.donmai.us')
    .delete(`/favorites/${id}.json`)
    .reply(200, reply)

  const result = await new Danbooru().favorites_destroy(id)
  expect(result).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})
