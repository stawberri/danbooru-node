require! <[tape ../src/index nock]>

tape 'class instantiation' -> it
  instance = new index!
  ..ok instance instanceof index, 'instanceof (with new)'
  ..ok (index!) instanceof index, 'instanceof (without new)'
  for key, value of instance
    ..ok key of index, "'#{key}' defined in module"
  ..end!

tape 'default parameters' -> it
  ..ok index.default-parameters?, \defined

  params = "p#{Math.random!}": "pp#{Math.random!}"
  params-test = index params
  ..same params-test.default-parameters, params, 'set by constructor'
  ..not params-test.default-parameters, params, 'not exactly the same object'
  ..not params-test.default-parameters, index.default-parameters, 'instance specific'

  user = "u#{Math.random!}"
  ..is (index user).default-parameters.login, user, 'saves users properly'

  key = "k#{Math.random!}"
  ..is (index user, key).default-parameters.api_key, key, 'saves keys properly'

  ..not-ok (index params, key).default-parameters.api_key?, 'no key saving with object'
  ..not-ok (index void key).default-parameters.api_key?, 'no key saving with void'

  ..end!

danbooru-host = \https://danbooru.donmai.us/

for let method in <[get post put delete]>
  tape "#{method} requests" (t) ->
    default-parameters = "d#{Math.random!}": "dd#{Math.random!}"
    passed-parameters = "p#{Math.random!}": "pp#{Math.random!}"
    expected-parameters = {} <<< default-parameters <<< passed-parameters

    path = "a#{Math.random!}"
    expected-path = "/#{path}.json"

    path = switch method
    | \get  => "/#{path}.json"
    | \post => "#{path}.xml"
    | \put  => "/#{path}"
    | _     => path

    expected-results = "e#{Math.random!}": "ee#{Math.random!}"

    n = nock danbooru-host
    m = if method is \get
      n.get expected-path
        .query expected-parameters
    else
      n[method] expected-path, expected-parameters
    m.reply 200, expected-results

    t.timeout-after 500
    instance = index default-parameters
    e, data <- instance[method] path, passed-parameters

    t
      ..error e, 'no errors'
      ..same data, expected-results, 'request complete'
      ..same instance.default-parameters, default-parameters, 'no default poisoning'

      ..does-not-throw n~done, 'all requests complete'
      ..end!
    nock.clean-all!

tape 'no return value' (t) ->
  t.plan 2

  nock danbooru-host
  t.timeout-after 500
  return-value = index.get \meow ->
    t.pass!
    nock.clean-all!
  t.not-ok return-value?

tape 'proper deep parameter handling' (t) ->
  address = "a#{Math.floor 5 * Math.random!}"

  deep-object-key = "k#{Math.random!}"
  deep-object =
    (deep-object-key):
      "b#{Math.random!}": "bb#{Math.random!}"
      "c#{Math.random!}": "cc#{Math.random!}"
  deep-object-check = JSON.stringify deep-object
  deep-object-modifier =
    (deep-object-key):
      "d#{Math.random!}": "dd#{Math.random!}"
      "e#{Math.random!}": "ee#{Math.random!}"
      "f#{Math.random!}": "ff#{Math.random!}"
      "g#{Math.random!}": "gg#{Math.random!}"
  deep-object-child = {} <<< deep-object[deep-object-key] <<< deep-object-modifier[deep-object-key]

  n = nock danbooru-host
    .get "/#{address}.json"
    .query {(deep-object-key): deep-object-child}
    .reply 200

  instance = index deep-object

  t.timeout-after 500
  e, data <- instance.get address, deep-object-modifier

  t
    ..is (JSON.stringify instance.default-parameters), deep-object-check, 'same object as before'
    ..does-not-throw n~done, 'all requests complete'
    ..end!
  nock.clean-all!


for let error in [200, 204, 403, 404, 420, 421, 422, 423, 424, 500, 503]
  tape "http error #{error}" (t) ->
    address = "a#{Math.floor 5 * Math.random!}"
    expected-response = "e#{Math.random!}": "ee#{Math.random!}"

    n = nock danbooru-host
      .get "/#{address}.json"
      .reply error, expected-response

    t.timeout-after 500
    e, data <- index.get address

    t
      ..ok ((error is 200) xor (e? && e instanceof Error)), 'error generation'
      ..same data, expected-response, 'body passing'
      ..does-not-throw n~done, 'all requests complete'
      ..end!
    nock.clean-all!

tape "request passthrough" (t) ->
  request = index~request

  address = "a#{Math.floor 5 * Math.random!}"
  n1 = nock danbooru-host
    .get "/#{address}"
    .reply 200

  t.timeout-after 500
  <- request address
  t
    ..error it, 'no errors'
    ..does-not-throw n1~done, 'strings are okay'

  address = "a#{Math.floor 5 * Math.random!}"
  n2 = nock danbooru-host
    .get "/#{address}"
    .reply 200
  <- request url: address
  t
    ..error it, 'no errors'
    ..does-not-throw n2~done, 'objects are okay'

  address = "a#{Math.floor 5 * Math.random!}"
  n3 = nock danbooru-host
    .get "/#{address}"
    .reply 200
  <- request url: address, base-url: 'http://google.com'
  t
    ..error it, 'no errors'
    ..does-not-throw n3~done, 'objects that mess up base-url are okay'
    ..end!
  nock.clean-all!

tape "actual request: /posts.json" (t) ->
  limit = 1 + Math.floor 5 * Math.random!

  t.timeout-after 5000
  e, data <- index.get 'posts' {limit}

  t
    ..error e, 'no errors'
    ..is data.length, limit, 'actually retrieves expected number of posts'

    post = data.0
    ..ok post.id?, 'post contains id'
    ..ok post.file_url?, 'post contains file url'

    ..end!
