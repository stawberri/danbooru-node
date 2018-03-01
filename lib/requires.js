Object.assign(exports, {
  http: require('http'),
  https: require('https'),
  URL: require('url').URL,
  btoa(b) {
    return Buffer.from(b).toString('base64')
  }
})
