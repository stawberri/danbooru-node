const Danbooru = require('../..')
const nock = require('nock')

beforeEach(() => nock.cleanAll())

test('get', async () => {
  const reply = { microchip: 53142 }
  const query = { generate: 'Direct Investment Account Tactics' }

  const scope = nock('https://danbooru.donmai.us')
    .get('/f9d4f26b44cf.json')
    .query(query)
    .reply(200, reply)

  const booru = new Danbooru()
  const response = await booru.get('f9d4f26b44cf', query)

  expect(response).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('post', async () => {
  const body = { bypass: 'deposit', payment: ['invoice', 'connect'] }
  const reply = { neural: 'installation Exclusive Texas' }

  const scope = nock('https://danbooru.donmai.us', {
    reqheaders: { 'content-type': 'application/json' }
  })
    .post('/fee2f342fbd8.json', body)
    .reply(200, reply)

  const booru = new Danbooru()
  const response = await booru.post('/fee2f342fbd8', body)

  expect(response).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('put', async () => {
  const body = { indexing: 'United States of America' }
  const reply = { optical: 'Fall zero defect' }

  const scope = nock('https://danbooru.donmai.us', {
    reqheaders: { 'content-type': 'application/json' }
  })
    .put('/ff33fdc4894e.json', body)
    .reply(200, reply)

  const booru = new Danbooru()
  const response = await booru.put('/ff33fdc4894e', body)

  expect(response).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})

test('delete', async () => {
  const body = { scale: 'Norfolk Island orange Granite' }
  const reply = { silver: 'Wisconsin Integration cross-platform' }

  const scope = nock('https://danbooru.donmai.us', {
    reqheaders: { 'content-type': 'application/json' }
  })
    .delete('/77af4d0af0e9.json', body)
    .reply(200, reply)

  const booru = new Danbooru()
  const response = await booru.delete('/77af4d0af0e9', body)

  expect(response).toMatchObject(reply)
  expect(scope.isDone()).toBeTruthy()
})
