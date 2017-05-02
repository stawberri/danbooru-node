const url = require('url')

exports = module.exports = class Danbooru {
  constructor(...args) {
    let booruOptions
    switch(args.length) {
      case 0:
        booruOptions = {}
      break

      case 1:
        if(args[0] instanceof exports)
          return args[0]
        else if(typeof args[0] === 'object')
          booruOptions = args[0]
        else if(typeof args[0] === 'string')
          booruOptions = {base: args[0]}
        else
          throw new TypeError('Danbooru requires an object or string when called with one argument')
      break

      case 2:
        if(typeof args[0] !== 'string')
          throw new TypeError('login must be a string')
        if(typeof args[1] !== 'string')
          throw new TypeError('api_key must be a string')
        booruOptions = {login: args[0], api_key: args[1]}
      break

      case 3:
        if(typeof args[0] !== 'string')
          throw new TypeError('login must be a string')
        if(typeof args[1] !== 'string')
          throw new TypeError('api_key must be a string')
        if(typeof args[2] !== 'object')
          throw new TypeError('options must be an object')

        booruOptions = Object.assign({login: args[0], api_key: args[1]}, args[2])
      break

      default:
        throw new Error('Too many arguments')
      break
    }

    let $this = $(this)

    let base = booruOptions.base || 'https://danbooru.donmai.us/'
    let parsedBase = url.parse(base)

    $this.defaults = {}
    if(parsedBase.auth) $this.defaults.auth = parsedBase.auth
    if(parsedBase.hostname) $this.defaults.hostname = parsedBase.hostname
    if(parsedBase.path && parsedBase.path !== '/')
      $this.basePath = parsedBase.path.replace(/\/*$/, '')
    if(parsedBase.port) $this.defaults.port = parsedBase.port
    if(parsedBase.protocol) $this.defaults.protocol = parsedBase.protocol

    if(booruOptions.login && booruOptions.api_key)
      $this.defaults.auth = `${booruOptions.login}:${booruOptions.api_key}`
  }

  async request(options, body) {
    if(typeof options === 'string') {
      let strParts = options.split(/\s/)
      switch(strParts.length) {
        case 0:
          throw new Error('Empty string passed as path')
        break

        case 1:
          options = {
            method: body ? 'POST' : 'GET',
            path: strParts[0]
          }
        break

        default:
          options = {
            method: strParts[0].toUpperCase(),
            path: slice(strParts, 1).join(' ')
          }
        break
      }
    }
    else options = Object.assign({}, options)

    options.path = options.path
      .replace(/^\/*/, '/')
      .replace(/(\.json)?(\?|$)/, '.json$2')

    let $this = $(this)
    if($this.basePath) options.path = $this.basePath + options.path

    Object.assign(options, $this.defaults)

    return new Promise((resolve, reject) => {
      let request
      if(options.protocol === 'https:')
        request = require('https').request(options, resolve)
      else
        request = require('http').request(options, resolve)

      request.on('error', reject)

      if(body) request.write(JSON.stringify(body))
      request.end()
    })
  }
}

exports.safe = class Safebooru extends exports {
  constructor(...args) {
    super(...args)

    let $this = $(this)
    delete $this.basePath
    $this.defaults = {
      hostname: 'safebooru.donmai.us',
      protocol: 'https:',
      auth: $this.defaults.auth
    }
  }
}

const intern = new WeakMap()
function $(booru) {
  if(!intern.has(booru)) intern.set(booru, {})
  return intern.get(booru)
}
