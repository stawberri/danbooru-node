const Danbooru = require('../..')

test('default authentication', () => {
  const booru = new Danbooru()
  expect(booru.user).toBeUndefined()
})

test('key is required for authentication', () => {
  const booru = new Danbooru('optical:')
  expect(booru.user).toBeUndefined()
})

test('default url', () => {
  const booru = new Danbooru()
  expect(booru.url).toBe('https://danbooru.donmai.us/')
})

test('authentication', () => {
  const booru = new Danbooru('olive:index')
  expect(booru).toMatchObject({
    user: 'olive',
    url: 'https://danbooru.donmai.us/'
  })
})

test('authentication and custom url', () => {
  const booru = new Danbooru('https://digitized:generating@safebooru.donmai.us')
  expect(booru).toMatchObject({
    user: 'digitized',
    url: 'https://safebooru.donmai.us/'
  })
})

test('url with extra components', () => {
  expect(new Danbooru('http://hijiribe.donmai.us////?hack#redundant').url).toBe(
    'http://hijiribe.donmai.us/'
  )
})

test('path with missing end slash', () => {
  expect(new Danbooru('http://sonohara.donmai.us/path').url).toBe(
    'http://sonohara.donmai.us/path/'
  )
})
