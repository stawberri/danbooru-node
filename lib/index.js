const Booru = require('./booru')
const constants = require('./constants')

module.exports = class Danbooru extends Booru {}

Object.assign(module.exports, constants)
