const Danbooru = require('<rootDir>')

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

it('turns root paths relative', () => {
  const booru = new Danbooru('https://danbooru.donmai.us/metal')
  const { href } = booru.url('/green')
  expect(href).toBe('https://danbooru.donmai.us/metal/green')
})

test('extra slashes and query strings are fine', () => {
  const booru = new Danbooru('https://danbooru.donmai.us/withdrawal')
  const { href } = booru.url('//////wireless?teal')
  expect(href).toBe('https://danbooru.donmai.us/withdrawal/wireless?teal')
})

it('resolves relative paths', () => {
  const booru = new Danbooru('https://danbooru.donmai.us/bypass')
  const { href } = booru.url('../workforce')
  expect(href).toBe('https://danbooru.donmai.us/workforce')
})
