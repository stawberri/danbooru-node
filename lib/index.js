const Booru = require('./booru')
const constants = require('./constants')
const resources = require('./resources')

module.exports = class Danbooru extends Booru {}

for (const resource of resources) {
  const keys = Object.getOwnPropertyNames(resource.prototype)
  for (const key of keys) {
    if (key === 'constructor') continue
    module.exports.prototype[key] = resource.prototype[key]
  }
}

Object.assign(module.exports, constants)
