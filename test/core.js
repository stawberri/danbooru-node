const test = require('tape')
const nock = require('nock')
const Danbooru = require('..')

nock.disableNetConnect()

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

  t.timeoutAfter(500)
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
    .put('/meow/alt.json', {
      nyaaa: 'meeew'
    }).basicAuth({user: 'nyaa', pass: 'meow'})
    .query({nyan: 'mew'})
    .reply(200)

  t.timeoutAfter(500)
  await new Danbooru('http://nyaa:meow@example.com/meow/')
    .request('put /alt?nyan=mew', {nyaaa: 'meeew'})
    .catch(e => t.error(e))

  t.true(alt.isDone(), 'sets baseURL, adds query strings properly, and supports other methods')
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

  t.timeoutAfter(500)
  await new Danbooru.safe('http://meow:nyaa@example.com/')
    .request('safe.json')
    .catch(e => t.error(e))

  t.true(safe.isDone(), "doesn't override auth")
  t.end()
})

test('requestBody return value', async t => {
  let bodyMeow = 'nyaa'
  let replyBody = {
    meowMeow: 'nyaaNyaa',
    cuties: 123,
    hungry: true
  }

  nock.cleanAll()
  let nocks = {
    'automatically sets post':
      nock('https://danbooru.donmai.us')
        .post('/bodytest.json', {bodyMeow})
        .times(2)
        .reply(200, replyBody),
    'sends method without body':
      nock('https://danbooru.donmai.us')
        .delete('/throttle.json')
        .reply(429, replyBody)
  }

  t.timeoutAfter(500)
  await Promise.all([
    new Danbooru().request('bodytest', {bodyMeow}).then(res => {
      t.false('body' in res, 'does not contain body by default')
      t.false('json' in res, 'does not contain json by default')
    }),
    new Danbooru().requestBody('bodytest', {bodyMeow}).then(res => {
      t.equal(res.body, JSON.stringify(replyBody), 'contains body')
      t.deepEqual(res.json, replyBody, 'contains json')
    }),
    new Danbooru().requestBody('delete throttle').then(res => {
      t.fail('does not ignore error status codes')
    }, e => {
      t.true(e instanceof Danbooru.Error, 'rejects an error')
      t.equal(e.statusCode, 429, 'passes status code in error')
      t.equal(e.message, 'user is throttled', 'sets message')
      t.deepEqual(e.response.json, replyBody, 'contains original response')
    })
  ])

  for(let key in nocks) t.true(nocks[key].isDone(), key)
  t.end()
})

test('requestBody follows redirects', async t => {
  let replyBody = {
    replyBodyTestNyaa: 'meow meow meow'
  }

  nock.cleanAll()
  nock('https://danbooru.donmai.us')
    .get('/redirect.json')
    .reply(301, '', {location: 'https://danbooru.donmai.us/redir.json'})
    .get('/redir.json')
    .reply(301, '', {location: '/redir/ect.json'})
    .get('/redir/ect.json')
    .reply(301, '', {location: 'ect/ed.jsonp'})
    .get('/redir/ect/ed.jsonp')
    .reply(301, '', {location: 'http://example.net/meow/meow/nya.js'})
  nock('http://example.net')
    .get('/meow/meow/nya.js')
    .reply(301, '', {location: '/nyaa'})
    .get('/nyaa')
    .reply(307, replyBody, {location: 'should.fail'})

  t.timeoutAfter(500)
  await new Danbooru().requestBody('redirect').then(res => {
    t.fail('follows redirects')
  }, e => {
    t.true(e instanceof Danbooru.Error, 'rejects an error')
    t.equal(e.statusCode, 307, 'passes status code in error')
    t.equal(e.message, 'too many redirects', 'sets message')
    t.deepEqual(e.response.json, replyBody, 'contains original response')
  })

  t.true(nock.isDone(), 'completes all redirects')
  t.end()
})

test('redirects maintain method, auth, and body', async t => {
  let requestBody = {meowMeowRequest: 'meow meow meow'}
  let replyBody = {nyaNyaReply: 'nya nya nya'}
  let auth = {user: 'meow', pass: 'nyaa'}

  nock.cleanAll()
  nock('https://danbooru.donmai.us')
    .delete('/cat/tree.json', requestBody)
    .basicAuth(auth)
    .reply(307, 'meow', {location: '../catnip.json'})
    .delete('/catnip.json', requestBody)
    .basicAuth(auth)
    .reply(301, 'nyaa', {location: 'http://example.com/final-place.nyaa'})
  nock('http://example.com')
    .delete('/final-place.nyaa', requestBody)
    .basicAuth(auth)
    .reply(200, replyBody)

  t.timeoutAfter(500)
  await new Danbooru(auth.user, auth.pass).requestBody('delete cat/tree', requestBody)
    .then(res => {
      t.deepEqual(res.json, replyBody, 'receives correct reply')
    })

  t.true(nock.isDone(), 'completes redirect')
  t.end()
})

nock.cleanAll()
nock.enableNetConnect()
