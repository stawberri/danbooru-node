const nock = require('nock')
const Booru = require('../lib/booru')

describe('booru constructor', () => {
  test('used by main export', () => {
    const Danbooru = require('..')
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
    expect(new Booru('http://hijiribe.donmai.us/?query#hash').url).toBe(
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
      .get('/resource')
      .reply(200, 'reply')

    const booru = new Booru()
    booru
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
