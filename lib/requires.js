/* eslint-env browser */
try {
  exports.http = require('http')
  exports.https = require('https')
} catch (error) {
  exports.fetch = fetch
}

try {
  exports.URL = require('url').URL
} catch (error) {
  exports.URL = URL
}

try {
  exports.btoa = b => Buffer.from(b).toString('base64')
} catch (error) {
  exports.btoa = btoa
}
