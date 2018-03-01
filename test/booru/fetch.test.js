const Danbooru = require('../..')
const nock = require('nock')
const { fetch } = require('../../lib/requires.js')

jest.mock('../../lib/requires.js', () => {
  const requires = require.requireActual('../../lib/requires.js')

  delete requires.http
  delete requires.https

  requires.fetch = jest.fn(require('node-fetch-polyfill'))

  return requires
})

beforeEach(() => {
  nock.cleanAll()
  jest.clearAllMocks()
})

test('basic fetch', async () => {
  const reply = 'array payment Zloty Fresh connecting'

  const scope = nock('https://danbooru.donmai.us')
    .get('/109f47ee27ad')
    .reply(200, reply)

  const booru = new Danbooru()
  const [type, value] = booru.request({ path: '109f47ee27ad' })
  const response = await value
  const text = await response.text()

  expect(type).toBe('fetch')
  expect(text).toBe(reply)

  expect(fetch).toHaveBeenCalled()
  expect(scope.isDone()).toBeTruthy()
})

test('json', async () => {
  const reply = { approach: 'Sports Grocery sky blue Junctions' }

  const scope = nock('https://danbooru.donmai.us')
    .get('/17e8a0e076c1.json')
    .reply(200, reply)

  const booru = new Danbooru()
  const response = await booru.json('17e8a0e076c1')
  expect(response).toMatchObject(reply)

  expect(fetch).toHaveBeenCalled()
  expect(scope.isDone()).toBeTruthy()
})

test('post', async () => {
  const body = { repurchase: 'granular value-added Communications' }
  const reply = { orchestrate: 'Intranet Fresh Intelligent' }

  const scope = nock('https://danbooru.donmai.us')
    .post('/76e6665c54b0.json', body)
    .reply(200, reply)

  const booru = new Danbooru()
  const response = await booru.post('76e6665c54b0', body)
  expect(response).toMatchObject(reply)

  expect(fetch).toHaveBeenCalled()
  expect(scope.isDone()).toBeTruthy()
})

test('posts show', async () => {
  const id = 68184
  const reply = { enhance: 'payment interfaces Concrete' }

  const scope = nock('https://danbooru.donmai.us')
    .get(`/posts/${id}.json`)
    .reply(200, reply)

  const booru = new Danbooru()
  const response = await booru.posts(id)
  expect(response).toMatchObject(reply)

  expect(fetch).toHaveBeenCalled()
  expect(scope.isDone()).toBeTruthy()
})
