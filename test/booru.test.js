const Danbooru = require('..')
const Booru = require('../lib/booru')
const nock = require('nock')

describe('booru constructor', () => {
  test('danbooru extends booru', () => {
    expect(new Danbooru()).toBeInstanceOf(Booru)
  })

  test('default authentication', () => {
    const booru = new Booru()
    expect(booru.user).toBeUndefined()
  })

  test('key is required for authentication', () => {
    const booru = new Booru('meow')
    expect(booru.user).toBeUndefined()
  })

  test('default url', () => {
    const booru = new Booru()
    expect(booru.url).toBe('https://danbooru.donmai.us/')
  })

  test('authentication', () => {
    const booru = new Booru('login:api_key')
    expect(booru).toMatchObject({
      user: 'login',
      url: 'https://danbooru.donmai.us/'
    })
  })

  test('authentication and custom url', () => {
    const booru = new Booru('https://login:api_key@safebooru.donmai.us')
    expect(booru).toMatchObject({
      user: 'login',
      url: 'https://safebooru.donmai.us/'
    })
  })

  test('url with extra components', () => {
    expect(new Booru('http://hijiribe.donmai.us////?query#hash').url).toBe(
      'http://hijiribe.donmai.us/'
    )
  })

  test('path with missing end slash', () => {
    expect(new Booru('http://sonohara.donmai.us/path').url).toBe(
      'http://sonohara.donmai.us/path/'
    )
  })
})

describe('booru connectivity', () => {
  test('basic node request', done => {
    const scope = nock('https://danbooru.donmai.us')
      .get('/a23cb13b8b18')
      .reply(200, 'reply')

    const booru = new Booru()
    const [type, val] = booru.request({ path: '/a23cb13b8b18' })

    expect(type).toBe('request')
    val.on('response', response => {
      expect(response.statusCode).toBe(200)

      let data = ''
      response.on('data', chunk => (data += chunk)).on('end', () => {
        expect(data).toBe('reply')
        expect(scope.isDone()).toBeTruthy()

        done()
      })
    })
  })

  test('json request and response', async () => {
    const requestBody = {
      key: 'value',
      boolean: false,
      number: 123
    }

    const responseBody = {
      response: true,
      array: [1, false, 'string', { key: 'value' }]
    }

    const scope = nock('http://safebooru.donmai.us', {
      reqheaders: { 'content-type': 'application/json' }
    })
      .post('/445d6c4c8393.json', requestBody)
      .reply(200, responseBody)

    const booru = new Booru('http://safebooru.donmai.us')
    const response = await booru.json('445d6c4c8393', {
      method: 'POST',
      body: requestBody
    })

    expect(response[Danbooru.status]).toBe(200)
    expect(response).toMatchObject(responseBody)
    expect(scope.isDone()).toBeTruthy()
  })

  test('basic auth and query string', async () => {
    const query = {
      key: 'value',
      number: 123,
      array: [
        { arrayKey: 'arrayValue' },
        'string',
        {
          arrayObjectKey: 'arrayObjectValue',
          arrayObjectArray: [1, 2, 3, false]
        }
      ]
    }

    const scope = nock('https://sonohara.donmai.us', {
      badheaders: ['content-type']
    })
      .get('/path/27f565dbb75e.json')
      .basicAuth({ user: 'login', pass: 'api_key' })
      .query(query)
      .reply(204)

    const booru = new Booru('https://login:api_key@sonohara.donmai.us/path')
    const response = await booru.json('/27f565dbb75e', {
      query
    })

    expect(response[Danbooru.status]).toBe(204)
    expect(scope.isDone()).toBeTruthy()
  })

  test('non-json response', async () => {
    const body = 'non-json string'
    const scope = nock('https://danbooru.donmai.us')
      .get('/d0869d2a257e.json')
      .reply(200, body)

    const booru = new Booru()
    const response = await booru.json('d0869d2a257e')

    expect(response).toBeInstanceOf(Error)
    expect(response).toMatchObject({
      [Danbooru.status]: 200,
      [Danbooru.data]: body
    })
    expect(scope.isDone()).toBeTruthy()
  })

  test('request and response headers', async () => {
    const reqheaders = {
      key: 'value',
      number: '123'
    }

    const resHeaders = {
      resKey: 'resValue',
      resNumber: '456'
    }

    const scope = nock('https://danbooru.donmai.us', { reqheaders })
      .get('/72f0c1717941.json')
      .reply(123, 'non-json response', resHeaders)

    const booru = new Booru()
    const response = await booru.json('/72f0c1717941', { headers: reqheaders })
    expect(response).toBeInstanceOf(Error)
    expect(response).toMatchObject({
      [Danbooru.status]: 123,
      [Danbooru.data]: 'non-json response',
      [Danbooru.headers]: resHeaders
    })
    expect(scope.isDone()).toBeTruthy()
  })
})
