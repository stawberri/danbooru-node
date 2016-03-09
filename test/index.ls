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

for method in <[post put delete]>
  tape "#{method} requests" (t) ->
    default-parameters = "d#{Math.random!}": "dd#{Math.random!}"
    passed-parameters = "p#{Math.random!}": "pp#{Math.random!}"
    expected-parameters = {} <<< default-parameters <<< passed-parameters

    path = "a#{Math.random!}".replace /\./ \meow
    expected-path = "/#{path}.json"

    expected-results = "e#{Math.random!}": "ee#{Math.random!}"

    n = nock danbooru-host
      .[method] expected-path, expected-parameters
      .reply 200, expected-results

    t.timeout-after 500

    instance = index default-parameters
    e, data <- instance[method] path, passed-parameters, _

    t
      ..error e
      ..same data, expected-results, 'request complete'
      ..same instance.default-parameters, default-parameters, 'no default poisoning'

      ..does-not-throw n~done
      ..end!

tape 'get requests' (t) ->
  default-parameters = "d#{Math.random!}": "dd#{Math.random!}"
  passed-parameters = "p#{Math.random!}": "pp#{Math.random!}"
  expected-parameters = {} <<< default-parameters <<< passed-parameters

  path = "p#{Math.random!}".replace /\./ \meow
  expected-path = "/#{path}.json"

  expected-results = "e#{Math.random!}": "ee#{Math.random!}"

  n = nock danbooru-host
    .get expected-path
    .query expected-parameters
    .reply 200, expected-results

  t.timeout-after 500

  instance = index default-parameters
  e, data <- instance.get path, passed-parameters, _

  t
    ..error e
    ..same data, expected-results, 'request complete'
    ..same instance.default-parameters, default-parameters, 'no default poisoning'

    ..does-not-throw n~done
    ..end!
