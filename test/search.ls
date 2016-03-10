require! <[tape ../src/search]>

tape 'defined in module' -> it
  fake-param = "s#{Math.random!}"
  fake-search = (fake-param): "ss#{Math.random!}"

  require! \../src/index

  for key of search
    ..ok key of index, "'#{key}' defined in module"
  ..end!

tape 'calls get with parameters' (t) ->
  tags = "a#{Math.random!} b#{Math.random!} c#{Math.random!}"
  params = "d#{Math.random!}": "dd#{Math.random!}"
  params-check = {} <<< params <<< {tags}
  error-check = "e#{Math.random!}": "ee#{Math.random!}"
  data-check = "f#{Math.random!}": "ff#{Math.random!}"
  callback-check = (e, data) ->
    t
     ..is e, error-check, 'same-error'
     for key of data-check
       ..ok key of data, "'#{key}' defined in data"
     ..end!

  simple-mock = {
    search.search
    get: ->
  }

  mock = {
    search.search
    get: (path, params, callback) ->
      t
        ..is path, \posts
        for key of params-check
          ..ok key of params, "'#{key}' defined in params"
      callback error-check, data-check
  }

  t.timeout-after 500
  simple-mock.search!
  mock.search tags, params, callback-check

tape 'doesn\'t replace any properties' (t) ->
  mock = {
    search.search
    get: (void,, callback) -> callback void {}
  }

  callback = (e, received-data) ->
    require! \../src/index
    e, data <- index.get \posts

    t
      for key of received-data
        ..not-ok key of data, "'#{key}' not in returned data"
      ..end!

  t.timeout-after 5000
  mock.search callback

tape 'load, next, and prev call their callbacks' (t) ->
  mock = {
    search.search
    get: (void,, callback) -> callback void {}
  }

  var loaded, nexted, preved
  check-success = ->
    t.end! if loaded and nexted and preved

  load-cb = ->
    loaded := true
    check-success!
  next-cb = ->
    nexted := true
    check-success!
  prev-cb = ->
    preved := true
    check-success!

  e, data <- mock.search!
  t.timeout-after 500
  data
    ..next next-cb
    ..load load-cb
    ..prev prev-cb

tape 'next and prev call load with their modifiers' (t) ->
  mock = {
    search.search
    get: (void,, callback) -> callback void {}
  }

  e, data <- mock.search!

  t
    ..plan 2
    ..timeout-after 500

  data.load = (num, callback) -> callback void, num

  next-mod = Math.floor 10 * Math.random!
  next-cb = (e, data) -> t.is data, 1 + next-mod, 'next works'
  data.next next-mod, next-cb

  prev-mod = Math.floor 10 * Math.random!
  prev-cb = (e, data) -> t.is data, 1 - prev-mod, 'prev works'
  data.prev prev-mod, prev-cb

tape 'page and tag can\'t be modified' (t) ->
  mock = {
    search.search
    get: (void,, callback) -> callback void {}
  }

  e, data <- mock.search!

  t
    original-page = data.page
    data.page = Math.random!
    ..is data.page, original-page, 'page doesn\'t change'

    original-tags = data.tags
    data.tags = Math.random!
    ..is data.tags, original-tags, 'tags doesn\'t change'

    ..end!

tape 'load replaces page requested' (t) ->
  mock = {
    search.search
    get: (void,, callback) -> callback void {}
  }

  e, data <- mock.search!

  wanted-page = 50 * Math.random!

  mock.get = (void, params, callback) ->
    t.is params.page, wanted-page, 'requests correct page'
    callback void {}

  e, data <- data.load wanted-page

  t
    ..is data.page, wanted-page, 'sets correct page'
    ..end!

tape 'add adds tags' (t) ->
  expected-tags = "a#{Math.random!} b#{Math.random!} c#{Math.random!}"

  mock = {
    search.search
    get: (void,, callback) -> callback void {}
  }

  e, data <- mock.search expected-tags

  extra-tags = "d#{Math.random!} e#{Math.random!} f#{Math.random!}"
  expected-tags += " #{extra-tags}"

  mock.get = (void, params, callback) ->
    t.is params.tags, expected-tags, 'correct tags requested'
    callback void {}

  e, data <- data.add extra-tags

  t
    ..is data.tags, expected-tags, 'correct tags set'
    ..end!


tape 'tags are cleaned up' (t) ->
  tag1 = "a#{Math.random!}"
  tag2 = "b#{Math.random!}"
  tag3 = "c#{Math.random!}"

  tags = "
    #{' ' * Math.ceil 10 * Math.random!}
    #{tag1}
    #{' ' * Math.ceil 10 * Math.random!}
    #{tag2}
    #{' ' * Math.ceil 10 * Math.random!}
    #{tag3}
    #{' ' * Math.ceil 10 * Math.random!}
    #{tag2}
    #{' ' * Math.ceil 10 * Math.random!}
    #{tag3}
    #{' ' * Math.ceil 10 * Math.random!}
    #{tag1}
    #{' ' * Math.ceil 10 * Math.random!}
  "
  tags-expected = "#{tag1} #{tag2} #{tag3}"

  mock = {
    search.search
    get: (void,, callback) -> callback void {}
  }

  e, data <- mock.search tags

  t
    ..is data.tags, tags-expected
    ..end!

tape 'tags are removed by rem' (t) ->
  tag1 = "a#{Math.random!}"
  tag2 = "b#{Math.random!}"
  tag3 = "c#{Math.random!}"
  tag4 = "d#{Math.random!}"
  tag5 = "e#{Math.random!}"
  tag6 = "f#{Math.random!}"
  expected-tags = "#{tag6} #{tag4} #{tag1}"
  extra-tags = "#{tag3} #{tag2} #{tag5}"
  tags = "#{tag2} #{tag6} #{tag5} #{tag4} #{tag3} #{tag1}"

  mock = {
    search.search
    get: (void,, callback) -> callback void {}
  }

  e, data <- mock.search tags

  mock.get = (void, params, callback) ->
    t.is params.tags, expected-tags, 'correct tags requested'
    callback void {}

  e, data <- data.rem extra-tags

  t
    ..is data.tags, expected-tags, 'correct tags set'
    ..end!

tape "actual request test" (t) ->
  require! \../src/index

  t.timeout-after 5000
  e, data <- index.search

  t
    ..error e, 'no errors'

    post = data.0
    ..ok post.id?, 'post contains id'
    ..ok post.file_url?, 'post contains file url'

  t.timeout-after 5000
  e, data <- data.next!

  t
    ..error e, 'no errors'

    post2 = data.0
    ..ok post2.id?, 'post contains id'
    ..ok post2.id < post.id, 'post is older'
    ..ok post2.file_url?, 'post contains file url'
    ..end!
