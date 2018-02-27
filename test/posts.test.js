const Danbooru = require('..')
const nock = require('nock')

describe('posts', () => {
  test('listing', async () => {
    const params = { limit: 97, tags: 'override gorgeous' }
    const reply = { quantifying: 'magenta azure approach' }

    const scope = nock('https://danbooru.donmai.us')
      .get('/posts.json')
      .query(params)
      .reply(200, reply)

    const danbooru = new Danbooru()
    expect(await danbooru.posts(params)).toMatchObject(reply)
    expect(scope.isDone()).toBeTruthy()
  })

  test('show', async () => {
    const id = 43561
    const reply = { blue: 'Turks and Caicos Islands invoice HTTP' }

    const scope = nock('https://danbooru.donmai.us')
      .get(`/posts/${id}.json`)
      .reply(200, reply)

    const danbooru = new Danbooru()
    expect(await danbooru.posts(id)).toMatchObject(reply)
    expect(scope.isDone()).toBeTruthy()
  })

  afterEach(() => nock.cleanAll())
})
