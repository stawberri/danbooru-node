require! <[https querystring]>

_=->it

module.exports = class exports
  (params = {}, key) ->
    return new exports ... unless @ instanceof exports

    if typeof params is \string
      @default-parameters = login: params
      @default-parameters.api_key = key if key?
    else
      @default-parameters = {} <<< params

  path-requests = (self, method, path, params, callback) ->
    let @ = self
      parameters = {} <<< @default-parameters <<< params
      path |>= parse-path
      path += "?#{querystring.stringify parameters}"
      request = danbooru-request {path, method} ->
        e, json-data <- response-to-json it
        return callback e if e?
        callback void, json-data
      |> _
        ..end!
  get: (path, params, callback) -> path-requests @, \GET, ...optionalizer ...

  body-requests = (self, method, path, params, callback) ->
    let @ = self
      parameters = {} <<< @default-parameters <<< params
      path |>= parse-path
      request = danbooru-request {path, method} ->
        e, json-data <- response-to-json it
        return callback e if e?
        callback void, json-data
      |> _
        ..end!
  post: (path, params, callback) -> body-requests @, \POST, ...optionalizer ...
  put: (path, params, callback) -> body-requests @, \PUT, ...optionalizer ...
  delete: (path, params, callback) -> body-requests @, \DELETE, ...optionalizer ...
  del: -> @delete ...
|> -> it <<<< it!

generic-options =
  hostname: \danbooru.donmai.us
  port: 443

function danbooru-request options, callback
  options = {} <<< generic-options <<< options
  https.request options, callback

function parse-path
  "/#{(it is /^\/?(.*?)(?:\.(?:json|xml)|)$/).1}.json"

function optionalizer path = '', params = {}, callback = (-> throw it if it?)
  if typeof params isnt \object
    [params, callback] = [{}, params]
  if typeof path isnt \string
    [path, params] = ['', path]
  if typeof params isnt \object
    [params, callback] = [{}, params]
  [path, params, callback]

function response-to-json response, callback
  text-data = ''
  response
    ..set-encoding \utf8
    ..on \data -> text-data += it
    ..on \end ->
      try
        callback void, JSON.parse text-data
      catch
        callback e
