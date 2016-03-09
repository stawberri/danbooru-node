require! <[tape nock ../src/index.ls]>

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
  ..not-ok (index void, key).default-parameters.api_key?, 'no key saving with void'

  ..end!

danbooru-host = \https://danbooru.donmai.us/

for let method in <[get post put delete]>
  tape "#{method} requests" (t) ->
    default-parameters = "d#{Math.random!}": "dd#{Math.random!}"
    passed-parameters = "p#{Math.random!}": "pp#{Math.random!}"
    expected-parameters = {} <<< default-parameters <<< passed-parameters

    path = "a#{Math.random!}".replace /\./ \meow
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
    e, data <- instance[method] path, passed-parameters, _

    t
      ..error e, 'no errors'
      ..same data, expected-results, 'request complete'
      ..same instance.default-parameters, default-parameters, 'no default poisoning'

      ..does-not-throw n~done, 'all requests complete'
      ..end!
    nock.clean-all!

tape 'no return value' (t) ->
  t.plan 2

  n = nock danbooru-host
    .get \/.json
    .reply 200

  t.timeout-after 500
  return-value = index.get ->
    t.does-not-throw n~done, 'all requests complete'
    nock.clean-all!
  t.not-ok return-value?


for let error in [200, 204, 403, 404, 420, 421, 422, 423, 424, 500, 503]
  tape "http error #{error}" (t) ->
    expected-response = "e#{Math.random!}": "ee#{Math.random!}"

    n = nock danbooru-host
      .get \/.json
      .reply error, expected-response

    t.timeout-after 500
    e, data <- index.get

    t
      ..ok ((error is 200) xor (e? && e instanceof Error)), 'error generation'
      ..same data, expected-response, 'body passing'
      ..does-not-throw n~done, 'all requests complete'
      ..end!
    nock.clean-all!

tape "actual request: /posts.json" (t) ->
  limit = 1 + Math.floor 5 * Math.random!

  t.timeout-after 1000
  e, data <- index.get 'posts' {limit}

  t
    ..error e, 'no errors'
    ..is data.length, limit, 'actually retrieves expected number of posts'

    post = data.0
    ..ok post.id?, 'post contains id'
    ..ok post.file_url?, 'post contains file url'

    ..end!
