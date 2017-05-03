const url = require('url')
const globals = require('./globals')
const util = require('./util')

const isFromBody = Symbol('is from body')
const isRedirect = Symbol('is redirect')

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

      default:
        if(typeof args[0] !== 'string')
          throw new TypeError('login must be a string')
        if(typeof args[1] !== 'string')
          throw new TypeError('api_key must be a string')
        if(typeof args[2] !== 'object')
          throw new TypeError('options must be an object')

        booruOptions = Object.assign({login: args[0], api_key: args[1]}, args[2])
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

  async request(...args) {
    let options, body, fromBody

    if(args[0] === isFromBody) [fromBody, options, body] = args
    else [options, body] = args

    if(typeof options === 'string') {
      let strParts = options.split(/\s/)
      switch(strParts.length) {
        case 0:
          options = {}
        break

        case 1:
          options = {
            method: 'GET',
            path: strParts[0]
          }
        break

        default:
          options = {
            method: strParts[0].toUpperCase(),
            path: strParts.slice(1).join(' ')
          }
        break
      }
    }
    else options = Object.assign({}, options)

    let $this = $(this)
    let originalOptions

    if(options.isRedirect === isRedirect) {
      let newUrl = url.resolve(options.originalUrl, options.location)
      let {hostname, path, port, protocol} = url.parse(newUrl)
      let auth = $this.defaults.auth

      options = options.originalOptions
      Object.assign(options, {auth, hostname, path, port, protocol})
      originalOptions = Object.assign({}, options)
    } else {
      if(!options.path) throw new TypeError('no path provided')
      originalOptions = Object.assign({}, options)
      options.path = options.path
        .replace(/^\/*/, '/')
        .replace(/(\.json)?(\?|$)/, '.json$2')
      if($this.basePath) options.path = $this.basePath + options.path
      Object.assign(options, $this.defaults)
    }

    let urlGetter = Object.assign({}, options)
    delete urlGetter.auth
    delete urlGetter.path
    delete urlGetter.pathname
    delete urlGetter.search
    delete urlGetter.query
    delete urlGetter.hash
    let originalUrl = url.format(urlGetter) + options.path

    if(options.method === 'GET' && body)
      options.path += util.qs(body)

    return new Promise((resolve, reject) => {
      let request
      if(options.protocol === 'https:')
        request = require('https').request(options)
      else
        request = require('http').request(options)

      request.on('response', response => {
        if(!fromBody) resolve(response)
        else resolve({response, originalUrl, originalOptions, body})
      })
      request.on('error', reject)

      if(options.method !== 'GET' && body) request.write(JSON.stringify(body))
      request.end()
    })
  }

  async requestBody(...args) {
    let redirects = 5
    if(args[0] === isRedirect) {
      let redirectResponse
      [, redirects, redirectResponse] = args
      if(redirects < 0)
        throw new globals.RedirectError(redirectResponse.response)
      else {
        let options = redirectResponse
        options.isRedirect = isRedirect
        options.location = redirectResponse.response.headers.location
        args = [options, redirectResponse.body]
      }
    }

    let responseObject = await this.request(isFromBody, ...args)
    let {response} = responseObject

    response.body = ''
    response.setEncoding('utf8')
    response.on('data', chunk => response.body += chunk)
    await new Promise(r => response.on('end', r))

    try {
      response.json = JSON.parse(response.body)
    } catch(e) {}

    if(response.statusCode >= 200 && response.statusCode < 300)
      if(response.json && response.json.success === false)
        throw new globals.APIError(response.json.message, response)
      else return response
    else if(response.statusCode < 400)
      return this.requestBody(isRedirect, --redirects, responseObject)
    else switch(response.statusCode) {
      case 400: throw new globals.BadRequestError(response)
      case 401: throw new globals.UnauthorizedError(response)
      case 403: throw new globals.ForbiddenError(response)
      case 404: throw new globals.NotFoundError(response)
      case 410: throw new globals.GoneError(response)
      case 420: throw new globals.InvalidRecordError(response)
      case 422: throw new globals.LockedError(response)
      case 423: throw new globals.AlreadyExistsError(response)
      case 424: throw new globals.InvalidParametersError(response)
      case 429: throw new globals.UserThrottledError(response)
      case 500: throw new globals.InternalServerError(response)
      case 503: throw new globals.ServiceUnavailableError(response)
      default: throw new globals.StatusCodeError(response)
    }
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
