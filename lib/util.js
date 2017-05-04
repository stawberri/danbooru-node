const url = require('url')
const htt = {
  get p() {
    delete htt.p
    return htt.p = require('http')
  },

  get ps() {
    delete htt.ps
    return htt.ps = require('https')
  }
}

let intern$ = new WeakMap()
exports.$ = (obj, props) => {
  if(!intern$.has(obj)) intern$.set(obj, {})
  $obj = intern$.get(obj)
  if(Object(props) === props) Object.assign($obj, props)
  return $obj
}

exports.qs = input => {
  if(
    !Array.isArray(input) &&
    Object(input) !== input
  ) throw new TypeError('input must be an object')

  let output = []

  unwrap(false, input)
  return '?' + output.join('&')

  function unwrap(base, input) {
    let before = '', after = ''
    if(base) {
      before = base + '['
      after = ']'
    }

    if(Array.isArray(input))
      for(let i = 0; i < input.length; i++) loop(i + '', input[i])
    else if(Object(input) === input)
      for(let key in input) loop(key, input[key])
    else
      output.push(base + '=' + encodeURIComponent(input))

    function loop(key, value) {
      unwrap(before + encodeURIComponent(key) + after, value)
    }
  }
}

exports.request = (options, requestFn = () => {}) => {
  options = Object.assign({}, options)

  let {redirections = 5} = options
  delete options.redirections

  let library = (options.protocol && options.protocol.startsWith('https')) ?
    htt.ps :
    htt.p
  let request = library.request(options)
  Promise.resolve(requestFn(request)).then(() => request.end())

  return new Promise((resolve, reject) => {
    request.on('error', reject)
    request.on('response', response => {
      if(
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location &&
        --redirections >= 0
      ) {
        let {hostname, path, port, protocol} = options
        let redirectUrl = url.format({hostname, port, protocol})
        redirectUrl = url.resolve(redirectUrl + path, response.headers.location)
        ;({hostname, path, port, protocol} = url.parse(redirectUrl))

        Object.assign(options, {
          hostname,
          path,
          port,
          protocol,
          redirections
        })
        resolve(exports.request(options, requestFn))
      } else {
        resolve(response)
      }
    })
  })
}
