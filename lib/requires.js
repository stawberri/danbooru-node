try {
  exports.http = require('http')
  exports.https = require('https')
  exports.URL = require('url').URL
  exports.btoa = b => Buffer.from(b).toString('base64')
} catch (error) {
  /* eslint-env browser */
  exports.fetch = fetch
  exports.URL = URL
  exports.btoa = btoa
}
