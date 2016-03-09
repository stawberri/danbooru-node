require! <[https request]>

_=->it

module.exports = class exports
  (params = {}, key) ->
    return new exports ... unless @ instanceof exports

    if typeof params is \string
      @default-parameters = login: params
      @default-parameters.api_key = key if key?
    else
      @default-parameters = {} <<< params

  danbooru-errors =
    204: '204 No Content: Request was successful'
    403: '403 Forbidden: Access denied'
    404: '404 Not Found: Not found'
    420: '420 Invalid Record: Record could not be saved'
    421: '421 User Throttled: User is throttled, try again later'
    422: '422 Locked: The resource is locked and cannot be modified'
    423: '423 Already Exists: Resource already exists'
    424: '424 Invalid Parameters: The given parameters were invalid'
    500: '500 Internal Server Error: Some unknown error occurred on the server'
    503: '503 Service Unavailable: Server cannot currently handle the request, try again later'

  stack-tracer = ->
    stack = {}
    [limit, Error.stack-trace-limit] = [Error.stack-trace-limit, Error.stack-trace-limit + 2]
    Error.capture-stack-trace stack, it
    Error.stack-trace-limit = limit
    stack.stack
  parse-path = -> "https://danbooru.donmai.us/#{(it is /^\/?(.*?)(?:\.(?:json|xml)|)$/).1}.json"
  do-request = (self, method, body, path, params, callback) ->
    let @ = self
      data = {} <<< @default-parameters <<< params
      data-name = if body then \form-data else \qs
      uri = parse-path path

      stacktrace = stack-tracer do-request

      request do
        {uri, method, (data-name): data, +json}
        (e, response, body) ->
          return callback e if e?
          unless response.status-code is 200
            error = new Error danbooru-errors[response.status-code]
            error.stack = stacktrace
            return callback error, body
          callback void, body
  optional_args = (path = '', params = {}, callback = -> throw it if it?) ->
    if typeof params isnt \object
      [params, callback] = [{}, params]
    if typeof path isnt \string
      [path, params] = ['', path]
    if typeof params isnt \object
      [params, callback] = [{}, params]
    [path, params, callback]

  get: (path, params, callback) -> do-request @, \GET, false, ...optional_args ...
  post: (path, params, callback) -> do-request @, \POST, true, ...optional_args ...
  put: (path, params, callback) -> do-request @, \PUT, true, ...optional_args ...
  delete: (path, params, callback) -> do-request @, \DELETE, true, ...optional_args ...
|> -> it <<<< it!




