const Danbooru = require('..')
const Requestable = require('../lib/requestable')

test('extends requestable', () => {
  expect(new Danbooru()).toBeInstanceOf(Requestable)
})
