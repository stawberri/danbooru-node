const nock = require('nock')
const Endpoint = require('../lib/endpoint')

describe('endpoint constructor', () => {
  test('used by main export', () => {
    const Danbooru = require('..')
    expect(new Danbooru()).toBeInstanceOf(Endpoint)
  })

  test('defaults to undefined login', () => {
    const endpoint = new Endpoint()
    expect(endpoint.user).toBeUndefined()
  })

  test('has undefined login if no key is provided', () => {
    const endpoint = new Endpoint('meow')
    expect(endpoint.user).toBeUndefined()
  })

  test('defaults to main url', () => {
    const endpoint = new Endpoint()
    expect(endpoint.url).toBe('https://danbooru.donmai.us/')
  })

  test('saves login', () => {
    const endpoint = new Endpoint('login:api_key')
    expect(endpoint).toMatchObject({
      user: 'login',
      url: 'https://danbooru.donmai.us/'
    })
  })

  test('saves login and url', () => {
    const endpoint = new Endpoint('https://login:api_key@safebooru.donmai.us')
    expect(endpoint).toMatchObject({
      user: 'login',
      url: 'https://safebooru.donmai.us/'
    })
  })

  test('cleans urls', () => {
    expect(new Endpoint('http://hijiribe.donmai.us/?query#hash').url).toBe(
      'http://hijiribe.donmai.us/'
    )
  })

  test('supports paths', () => {
    expect(new Endpoint('http://sonohara.donmai.us/path').url).toBe(
      'http://sonohara.donmai.us/path/'
    )
  })
})

describe('endpoint connectivity', () => {
  test('makes requests', done => {
    const scope = nock('https://danbooru.donmai.us')
      .get('/resource')
      .reply(200, 'reply')

    const endpoint = new Endpoint()
    endpoint
      .request({ path: '/resource' }, response => {
        expect(response.statusCode).toBe(200)

        let data = ''
        response.on('data', chunk => (data += chunk)).on('end', () => {
          expect(data).toBe('reply')
          expect(scope.isDone()).toBeTruthy()

          done()
        })
      })
      .end()
  })
})
