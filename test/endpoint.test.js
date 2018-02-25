const Danbooru = require('..')
const Endpoint = require('../lib/endpoint')

test('extends endpoint', () => {
  expect(new Danbooru()).toBeInstanceOf(Endpoint)
})
