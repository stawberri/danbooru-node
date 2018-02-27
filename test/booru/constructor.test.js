const Danbooru = require('../..')

test('default authentication', () => {
  const booru = new Danbooru()
  expect(booru.auth()).toBeUndefined()
})

test('key is required for authentication', () => {
  const booru = new Danbooru('optical:')
  expect(booru.auth()).toBeUndefined()
})

test('default url', () => {
  const booru = new Danbooru()
  expect(booru.url().href).toBe('https://danbooru.donmai.us/')
})

test('authentication', () => {
  const booru = new Danbooru('olive:index')
  expect(booru.auth()).toBe('olive')
  expect(booru.url().href).toBe('https://danbooru.donmai.us/')
})

test('authentication and custom url', () => {
  const booru = new Danbooru('https://digitized:generating@safebooru.donmai.us')
  expect(booru.auth()).toBe('digitized')
  expect(booru.url().href).toBe('https://safebooru.donmai.us/')
})

test('url with extra components', () => {
  const booru = new Danbooru('http://hijiribe.donmai.us////?hack#redundant')
  expect(booru.url().href).toBe('http://hijiribe.donmai.us/')
})

test('path with missing end slash', () => {
  const booru = new Danbooru('http://sonohara.donmai.us/path')
  expect(booru.url().href).toBe('http://sonohara.donmai.us/path/')
})

test('authentication and custom url change', () => {
  const booru = new Danbooru()
  expect(booru.auth()).toBeUndefined()
  expect(booru.url().href).toBe('https://danbooru.donmai.us/')

  booru.auth('transmit:compressing')
  expect(booru.auth()).toBe('transmit')
  expect(booru.url().href).toBe('https://danbooru.donmai.us/')

  booru.auth('http://hijiribe.donmai.us/')
  expect(booru.auth()).toBe('transmit')
  expect(booru.url().href).toBe('http://hijiribe.donmai.us/')

  booru.auth('http://deposit:models@sonohara.donmai.us/')
  expect(booru.auth()).toBe('deposit')
  expect(booru.url().href).toBe('http://sonohara.donmai.us/')

  booru.auth('connecting:index')
  expect(booru.auth()).toBe('connecting')
  expect(booru.url().href).toBe('http://sonohara.donmai.us/')

  booru.auth('https://danbooru.donmai.us/')
  expect(booru.auth()).toBe('connecting')
  expect(booru.url().href).toBe('https://danbooru.donmai.us/')

  booru.auth(false)
  expect(booru.auth()).toBeUndefined()
  expect(booru.url().href).toBe('https://danbooru.donmai.us/')
})
