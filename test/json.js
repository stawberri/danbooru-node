const test = require('tape')
const Danbooru = require('..')

test('begin json', t => {
  t.end()
})

test('request json', t => {
  t.plan(2)

  let booru = new Danbooru()

  t.timeoutAfter(5000)
  booru.requestJson('posts', {
    md5: '0f9dfcbfd546fdf44420a131a026fe69'
  }).catch(e => {
    t.true(e instanceof Error, 'throws an error for non-json content')
  })


  booru.requestJson('posts', {tags: 'fox_ears maid'}).then(() => {
    t.pass('does not throw an error for json content')
  }, e => t.error(e))
})

test('end json', t => {
  t.end()
})
