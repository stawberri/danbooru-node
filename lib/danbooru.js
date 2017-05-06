const url = require('url')
const error = require('./error')
const util = require('./util')
const Post = require('./post')

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

    let base = booruOptions.base || 'https://danbooru.donmai.us'
    let parsedBase = url.parse(base)


    let $this = util.$(this, {defaults: {}})
    if(parsedBase.auth) $this.defaults.auth = parsedBase.auth
    if(parsedBase.hostname) $this.defaults.hostname = parsedBase.hostname
    if(parsedBase.path && parsedBase.path !== '/')
      $this.basePath = parsedBase.path.replace(/\/*$/, '')
    if(parsedBase.port) $this.defaults.port = parsedBase.port
    if(parsedBase.protocol) $this.defaults.protocol = parsedBase.protocol

    if(booruOptions.login && booruOptions.api_key)
      $this.defaults.auth = `${booruOptions.login}:${booruOptions.api_key}`
  }

  request(options, requestFunction) {
    options.path = options.path.replace(/^\/*/, '/')

    let $this = util.$(this)
    if($this.basePath) options.path = $this.basePath + options.path
    Object.assign(options, $this.defaults)
    return util.request(options, requestFunction)
  }

  async requestJson(options, body) {
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
    } else options = Object.assign({}, options)

    if(!options.path) throw new TypeError('no path provided')
    options.path = options.path.replace(/(\.json)?(\?|$)/, '.json$2')

    if(options.method === 'GET' && body)
      options.path += util.qs(body)

    options.headers = options.headers || {}
    if(options.method !== 'GET' && body) {
      options.headers = {
        'content-type': 'application/json'
      }
    }

    let response = await this.request(options, request => {
      if(options.method !== 'GET' && body)
        request.write(JSON.stringify(body))
    })

    response.body = ''
    response.setEncoding('utf8')
    response.on('data', chunk => response.body += chunk)
    await new Promise(r => response.on('end', r))

    let jsonParseError
    try {
      response.json = JSON.parse(response.body)
    } catch(err) {
      jsonParseError = err
      jsonParseError.response = response
      jsonParseError.statusCode = response.statusCode
    }

    if(response.statusCode >= 200 && response.statusCode < 300) {
      if(response.json && response.json.success === false)
        throw new error.APIError(response.json.message, response)
    } else if(response.statusCode < 400) {
      throw new error.RedirectError(response)
    } else switch(response.statusCode) {
      case 400: throw new error.BadRequestError(response)
      case 401: throw new error.UnauthorizedError(response)
      case 403: throw new error.ForbiddenError(response)
      case 404: throw new error.NotFoundError(response)
      case 410: throw new error.GoneError(response)
      case 420: throw new error.InvalidRecordError(response)
      case 422: throw new error.LockedError(response)
      case 423: throw new error.AlreadyExistsError(response)
      case 424: throw new error.InvalidParametersError(response)
      case 429: throw new error.UserThrottledError(response)
      case 500: throw new error.InternalServerError(response)
      case 503: throw new error.ServiceUnavailableError(response)
      default: throw new error.StatusCodeError(response)
    }

    if(jsonParseError) throw jsonParseError
    else return response.json
  }

  get posts() {
    let posts = async (options) => {
      if(Array.isArray(options) || Object(options) !== options)
        options = {tags: options}
      if(Array.isArray(options.tags))
        options.tags = options.tags.join(' ')
      else if(!options.tags)
        options.tags = ''

      return Post.ify(this, await this.requestJson('posts', options))
    }

    posts.get = async (post_id) => {
      post_id = Post.id(post_id)
      return Post.ify(this, await this.requestJson('posts/' + post_id))
    }

    return posts
  }

  get favorites() {
    let favorites = async () => {
      return Post.ify(this, await this.requestJson('favorites'))
    }

    favorites.add = async post_id => {
      post_id = Post.id(post_id)
      return (await this.requestJson('post favorites', {post_id})).success
    }

    favorites.delete = async post_id => {
      post_id = Post.id(post_id)
      return (await this.requestJson('delete favorites/' + post_id)).success
    }

    return favorites
  }
}

exports.Safebooru = class Safebooru extends exports {
  constructor(...args) {
    super(...args)

    let $this = util.$(this)
    delete $this.basePath
    $this.defaults = {
      hostname: 'safebooru.donmai.us',
      protocol: 'https:',
      auth: $this.defaults.auth
    }
  }
}
