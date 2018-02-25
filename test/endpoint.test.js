jest.mock('http').mock('https')

const Endpoint = require('../lib/endpoint')
// const http = require('http')
// const https = require('https')

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
    const endpoint = new Endpoint('meow:nyan')
    expect(endpoint).toMatchObject({
      user: 'meow',
      url: 'https://danbooru.donmai.us/'
    })
  })

  test('saves login and url', () => {
    const endpoint = new Endpoint('https://meow:nyan@safebooru.donmai.us/')
    expect(endpoint).toMatchObject({
      user: 'meow',
      url: 'https://safebooru.donmai.us/'
    })
  })

  test('cleans urls', () => {
    expect(new Endpoint('http://hijiribe.donmai.us/?nyan#meow').url).toBe(
      'http://hijiribe.donmai.us/'
    )
  })

  test('adds missing url parts', () => {
    expect(new Endpoint('http://sonohara.donmai.us').url).toBe(
      'http://sonohara.donmai.us/'
    )
  })
})
