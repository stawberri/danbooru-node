const test = require('tape')
const nock = require('nock')
const Danbooru = require('..')

test('begin core', t => {
  nock.disableNetConnect()
  t.end()
})

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
    .reply(200, {})

  let comma = nock('https://danbooru.donmai.us')
    .get('/comma.json')
    .basicAuth({user, pass})
    .reply(200, {})

  let object = nock('https://danbooru.donmai.us')
    .get('/object.json')
    .basicAuth({user, pass})
    .reply(200, {})

  t.timeoutAfter(500)
  await Promise.all([
    new Danbooru().requestJson('/noauth'),
    new Danbooru(login, api_key).requestJson('/comma'),
    new Danbooru({login, api_key}).requestJson('/object')
  ]).catch(e => t.error(e))

  t.true(noauth.isDone(), 'makes unauthed requests')
  t.true(comma.isDone(), 'makes authed requests with two strings')
  t.true(object.isDone(), 'makes authed requests with object')
  t.end()
})

test('safebooru shortcut', async t => {
  t.true(new Danbooru.Safebooru() instanceof Danbooru.Safebooru, 'is a class')
  t.true(new Danbooru.Safebooru() instanceof Danbooru, 'extends Danbooru')

  nock.cleanAll()
  let safe = nock('https://safebooru.donmai.us')
    .get('/safe.json')
    .basicAuth({user: 'meow', pass: 'nyaa'})
    .reply(200, {})

  t.timeoutAfter(500)
  await new Danbooru.Safebooru('http://meow:nyaa@example.com/')
    .requestJson('safe.json')
    .catch(e => t.error(e))

  t.true(safe.isDone(), "doesn't override auth")
  t.end()
})

test('end core', t => {
  nock.cleanAll()
  nock.enableNetConnect()
  t.end()
})
