const Danbooru = require('..')
const Booru = require('../lib/booru')
const nock = require('nock')

describe('booru constructor', () => {
  test('used by main export', () => {
    expect(new Danbooru()).toBeInstanceOf(Booru)
  })

  test('defaults to undefined login', () => {
    const booru = new Booru()
    expect(booru.user).toBeUndefined()
  })

  test('has undefined login if no key is provided', () => {
    const booru = new Booru('meow')
    expect(booru.user).toBeUndefined()
  })

  test('defaults to main url', () => {
    const booru = new Booru()
    expect(booru.url).toBe('https://danbooru.donmai.us/')
  })

  test('saves login', () => {
    const booru = new Booru('login:api_key')
    expect(booru).toMatchObject({
      user: 'login',
      url: 'https://danbooru.donmai.us/'
    })
  })

  test('saves login and url', () => {
    const booru = new Booru('https://login:api_key@safebooru.donmai.us')
    expect(booru).toMatchObject({
      user: 'login',
      url: 'https://safebooru.donmai.us/'
    })
  })

  test('cleans urls', () => {
    expect(new Booru('http://hijiribe.donmai.us////?query#hash').url).toBe(
      'http://hijiribe.donmai.us/'
    )
  })

  test('supports paths', () => {
    expect(new Booru('http://sonohara.donmai.us/path').url).toBe(
      'http://sonohara.donmai.us/path/'
    )
  })
})

describe('booru connectivity', () => {
  test('makes requests', done => {
    const scope = nock('https://danbooru.donmai.us')
      .get('/makes-requests')
      .reply(200, 'reply')

    const booru = new Booru()
    const [type, val] = booru.request({ path: '/makes-requests' })

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

  test('handles json', async () => {
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
      .post('/handles-json.json', requestBody)
      .reply(200, responseBody)

    const booru = new Booru('http://safebooru.donmai.us')
    const response = await booru.json('handles-json', {
      method: 'POST',
      body: requestBody
    })

    expect(response[Danbooru.status]).toBe(200)
    expect(response).toMatchObject(responseBody)
    expect(scope.isDone()).toBeTruthy()
  })

  test('has correct auth and queries', async () => {
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
      .get('/path/has-correct-auth-and-queries.json')
      .basicAuth({ user: 'login', pass: 'api_key' })
      .query(query)
      .reply(204)

    const booru = new Booru('https://login:api_key@sonohara.donmai.us/path')
    const response = await booru.json('/has-correct-auth-and-queries', {
      query
    })

    expect(response[Danbooru.status]).toBe(204)
    expect(scope.isDone()).toBeTruthy()
  })

  test('resolves parsing errors', async () => {
    const body = 'non-json string'
    const scope = nock('https://danbooru.donmai.us')
      .get('/resolves-parsing-errors.json')
      .reply(200, body)

    const booru = new Booru()
    const response = await booru.json('resolves-parsing-errors')

    expect(response).toBeInstanceOf(Error)
    expect(response).toMatchObject({
      [Danbooru.status]: 200,
      [Danbooru.data]: body
    })
    expect(scope.isDone()).toBeTruthy()
  })

  test('has headers', async () => {
    const reqheaders = {
      key: 'value',
      number: '123'
    }

    const resHeaders = {
      resKey: 'resValue',
      resNumber: '456'
    }

    const scope = nock('https://danbooru.donmai.us', { reqheaders })
      .get('/has-headers.json')
      .reply(123, 'non-json response', resHeaders)

    const booru = new Booru()
    const response = await booru.json('has-headers', { headers: reqheaders })
    expect(response).toBeInstanceOf(Error)
    expect(response).toMatchObject({
      [Danbooru.status]: 123,
      [Danbooru.data]: 'non-json response',
      [Danbooru.headers]: resHeaders
    })
    expect(scope.isDone()).toBeTruthy()
  })
})
