const test = require('tape')
const nock = require('nock')
const Danbooru = require('..')

nock.disableNetConnect()

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
    new Danbooru().request('post bodytest', {bodyMeow}).then(res => {
      t.false('body' in res, 'does not contain body by default')
      t.false('json' in res, 'does not contain json by default')
    }),
    new Danbooru().requestBody('post bodytest', {bodyMeow}).then(res => {
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
  ]).catch(e => t.error(e))

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

test('danbooru type errors', async t => {
  let okError = {success: false, message: 'ok error'}
  let infoError = {success: false, message: 'info error'}
  let notError = {success: true, message: 'not error'}
  let notErrorAgain = {message: 'not error again'}

  nock.cleanAll()
  nock('https://danbooru.donmai.us')
    .get('/okerror.json')
    .reply(200, okError)
    .get('/normalerror.json')
    .reply(404, 'normal error')
    .get('/infoerror.json')
    .reply(410, infoError)
    .get('/noterror.json')
    .reply(200, notError)
    .get('/noterroragain.json')
    .reply(200, notErrorAgain)

  await Promise.all([
    new Danbooru().requestBody('okerror').catch(e => {
      t.equal(e.message, okError.message, 'throws error even on 200 if success is false')
    }),
    new Danbooru().requestBody('normalerror').catch(e => {
      t.equal(e.message, 'not found', 'defaults to default error message')
    }),
    new Danbooru().requestBody('infoerror').catch(e => {
      t.equal(e.message, infoError.message, 'sets message if given one')
    }),
    new Danbooru().requestBody('noterror').then(res => {
      t.deepEqual(res.json, notError, 'does not throw error if success is true')
    }),
    new Danbooru().requestBody('noterroragain').then(res => {
      t.deepEqual(res.json, notErrorAgain, 'does not throw error if no success')
    })
  ]).catch(e => t.error(e))

  t.true(nock.isDone(), 'performs requests')
  t.end()
})

test('querystring generator', async t => {
  let query = {
    meow: 'nyaa',
    nyan: 'mew',
    fruits: [
      'apple',
      'orange',
      'banana',
      'grape'
    ],
    food: {
      cake: {
        chocolate: 'yum',
        carrot: 'pretty good'
      },
      cabbage: 'green',
      chocolate: 'delicious'
    },
    symbols: [
      '+#@#$*(%)',
      '===$$&&=',
      {
        '$#@$6%#=#$#%': '$#)@(*#@%',
        '#@$(*%)': '(#$*@)'
      },
      ['♣', '🎄', '¤', '🍮']
    ]
  }
  let arrayQuery = [
    'meow', 'nyaa', 'mew', 'nyan'
  ]
  let emptyQuery = {}

  nock.cleanAll()
  nock('https://danbooru.donmai.us')
    .get('/querytest.json')
    .query(query)
    .reply(200)
    .get('/arrayQuery.json')
    .query(arrayQuery)
    .reply(200)
    .get('/emptyquery.json')
    .query(emptyQuery)
    .reply(200)

  let booru = new Danbooru()
  t.timeoutAfter(500)
  await Promise.all([
    booru.request('querytest', query),
    booru.request('arrayQuery', arrayQuery),
    booru.request('emptyquery', emptyQuery)
  ]).catch(e => t.error(e))

  t.true(nock.isDone(), 'sends queries correcctly')
  t.end()
})

nock.cleanAll()
nock.enableNetConnect()
