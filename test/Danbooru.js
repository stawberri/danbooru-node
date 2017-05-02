const test = require('tape')
const Danbooru = require('../lib')

test('module basics', t => {
  t.plan(2)

  t.equal(typeof Danbooru, 'function', 'exports a function')
  t.true(new Danbooru() instanceof Danbooru, 'exports a class')
})
