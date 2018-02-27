const Danbooru = require('../..')
const Booru = require('../../lib/booru')

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
