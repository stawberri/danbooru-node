const resources = require('./resources')
const constants = require('./constants')

class Danbooru extends resources {}

Danbooru.data = constants.data
Danbooru.headers = constants.headers
Danbooru.status = constants.status

module.exports = Danbooru
