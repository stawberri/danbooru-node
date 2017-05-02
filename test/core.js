const test = require('tape')
const nock = require('nock')
const Danbooru = require('..')

test('module basics', t => {
  t.equal(typeof Danbooru, 'function', 'is a function')
  t.true(new Danbooru() instanceof Danbooru, 'is a class')

  t.end()
})

test('passing instance to constructor', t => {
  let booru = new Danbooru()
  t.equal(new Danbooru(booru), booru, 'returns the same instance')

  t.end()
})

test('login and api_key instantiation', async t => {
  let login = 'LOGIN'
  let api_key = 'API_KEY'

  let user = login
  let pass = api_key

  nock.cleanAll()
  let noauth = nock('https://danbooru.donmai.us', {
    badheaders: ['authorization']
  }).get('/noauth.json')
    .reply(200)

  let comma = nock('https://danbooru.donmai.us')
    .get('/comma.json')
    .basicAuth({user, pass})
    .reply(200)

  let object = nock('https://danbooru.donmai.us')
    .get('/object.json')
    .basicAuth({user, pass})
    .reply(200)

  await Promise.all([
    new Danbooru().request('/noauth'),
    new Danbooru(login, api_key).request('/comma'),
    new Danbooru({login, api_key}).request('/object')
  ]).catch(e => t.error(e))

  t.true(noauth.isDone(), 'makes unauthed requests')
  t.true(comma.isDone(), 'makes authed requests with two strings')
  t.true(object.isDone(), 'makes authed requests with object')
  t.end()
})

test('additional request url features', async t => {
  nock.cleanAll()
  let alt = nock('http://example.com')
    .get('/meow/alt.json')
    .basicAuth({user: 'nyaa', pass: 'meow'})
    .query({nyan: 'mew'})
    .reply(200)

  await new Danbooru('http://nyaa:meow@example.com/meow/')
    .request('/alt?nyan=mew')
    .catch(e => t.error(e))

  t.true(alt.isDone(), 'sets baseURL, adds query strings properly, and baseURL shortcut works')
  t.end()
})

test('safebooru shortcut', async t => {
  t.true(new Danbooru.safe() instanceof Danbooru.safe, 'is a class')
  t.true(new Danbooru.safe() instanceof Danbooru, 'extends Danbooru')

  nock.cleanAll()
  let safe = nock('https://safebooru.donmai.us')
    .get('/safe.json')
    .basicAuth({user: 'meow', pass: 'nyaa'})
    .reply(200)

  await new Danbooru.safe('http://meow:nyaa@example.com/')
    .request('safe.json')
    .catch(e => t.error(e))

  t.true(safe.isDone(), "doesn't override auth")
  t.end()
})
