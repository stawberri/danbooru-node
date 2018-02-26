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
    const booru = new Booru('optical:')
    expect(booru.user).toBeUndefined()
  })

  test('default url', () => {
    const booru = new Booru()
    expect(booru.url).toBe('https://danbooru.donmai.us/')
  })

  test('authentication', () => {
    const booru = new Booru('olive:index')
    expect(booru).toMatchObject({
      user: 'olive',
      url: 'https://danbooru.donmai.us/'
    })
  })

  test('authentication and custom url', () => {
    const booru = new Booru('https://digitized:generating@safebooru.donmai.us')
    expect(booru).toMatchObject({
      user: 'digitized',
      url: 'https://safebooru.donmai.us/'
    })
  })

  test('url with extra components', () => {
    expect(new Booru('http://hijiribe.donmai.us////?hack#redundant').url).toBe(
      'http://hijiribe.donmai.us/'
    )
  })

  test('path with missing end slash', () => {
    expect(new Booru('http://sonohara.donmai.us/path').url).toBe(
      'http://sonohara.donmai.us/path/'
    )
  })
})

describe('basic requests and json', () => {
  test('basic node request', done => {
    const scope = nock('https://danbooru.donmai.us')
      .get('/a23cb13b8b18')
      .reply(200, 'synthesize')

    const booru = new Booru()
    const [type, val] = booru.request({ path: '/a23cb13b8b18' })

    expect(type).toBe('request')
    val.on('response', response => {
      expect(response.statusCode).toBe(200)

      let data = ''
      response.on('data', chunk => (data += chunk)).on('end', () => {
        expect(data).toBe('synthesize')
        expect(scope.isDone()).toBeTruthy()

        done()
      })
    })
  })

  test('json request and response', async () => {
    const requestBody = {
      reboot: 'Utah channels bandwidth',
      outdoors: true,
      quality: 45183
    }

    const responseBody = {
      borders: false,
      virtual: [83757, true, 'real-time Executive', { seamless: 'auxiliary' }]
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
      overriding: 'Checking Account standardization South Carolina',
      interfaces: 40999,
      quantifying: [
        { multiByte: 'Handcrafted Rubber Wyoming' },
        'transmitting payment partnerships Configuration niches',
        {
          circuit: 'optical withdrawal Mouse',
          whiteboard: [87010, 50573, 98440, true]
        }
      ]
    }

    const scope = nock('https://sonohara.donmai.us', {
      badheaders: ['content-type']
    })
      .get('/path/27f565dbb75e.json')
      .basicAuth({ user: 'turquoise', pass: 'with' })
      .query(query)
      .reply(204)

    const booru = new Booru('https://turquoise:with@sonohara.donmai.us/path')
    const response = await booru.json('/27f565dbb75e', {
      query
    })

    expect(response[Danbooru.status]).toBe(204)
    expect(scope.isDone()).toBeTruthy()
  })

  test('non-json response', async () => {
    const body = 'Well Forest Intelligent Soft Car'
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
      global: 'user-facing Somali Shilling Frozen',
      mobile: 'Romania primary Customer'
    }

    const resHeaders = {
      withdrawal: 'Legacy RSS quantifying',
      online: 'Agent Administrator International',
      monetize: 'Checking Account withdrawal'
    }

    const body = 'Analyst Cook Islands Integration'

    const scope = nock('https://danbooru.donmai.us', { reqheaders })
      .get('/72f0c1717941.json')
      .reply(123, body, resHeaders)

    const booru = new Booru()
    const response = await booru.json('/72f0c1717941', { headers: reqheaders })
    expect(response).toBeInstanceOf(Error)
    expect(response).toMatchObject({
      [Danbooru.status]: 123,
      [Danbooru.data]: body,
      [Danbooru.headers]: resHeaders
    })
    expect(scope.isDone()).toBeTruthy()
  })

  test('query, body, and arrays', async () => {
    const body = { architect: 'optimize generating Lebanese Pound' }
    const query = ['Forge foreground Avon', 'Industrial Frozen']
    const reply = [true, 'methodical', 34148, 'Forge Money Market Account']

    const scope = nock('https://danbooru.donmai.us', {
      reqheaders: { 'content-type': 'application/json' }
    })
      .put('/9b05655a2aa5.json', body)
      .query(query)
      .reply(200, reply)

    const booru = new Booru()
    const response = await booru.json('9b05655a2aa5', {
      method: 'PUT',
      body,
      query
    })

    expect(response).toEqual(expect.arrayContaining(reply))
    expect(response).toHaveLength(reply.length)
    expect(scope.isDone()).toBeTruthy()
  })

  afterEach(() => nock.cleanAll())
})

describe('json request methods', () => {
  test('get', async () => {
    const reply = { microchip: 53142 }
    const query = { generate: 'Direct Investment Account Tactics' }

    const scope = nock('https://danbooru.donmai.us')
      .get('/f9d4f26b44cf.json')
      .query(query)
      .reply(200, reply)

    const booru = new Booru()
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

    const booru = new Booru()
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

    const booru = new Booru()
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

    const booru = new Booru()
    const response = await booru.delete('/77af4d0af0e9', body)

    expect(response).toMatchObject(reply)
    expect(scope.isDone()).toBeTruthy()
  })

  afterEach(() => nock.cleanAll())
})
