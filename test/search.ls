require! <[tape ../src/search nock]>

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
    get: (void,, callback) -> callback void [{}]
  }

  var return-value
  callback = (e, received-data) ->
    require! \../src/index
    e, data <- index.get \posts

    t
      for key of received-data when key isnt '0'
        ..not-ok key of data, "'#{key}' not in api data"
        ..ok key of return-value, "'#{key}' in returned value"

      received-data .= 0
      data .= 0

      for key of received-data
        ..not-ok key of data, "'#{key}' not in api post data"
      ..end!

  t.timeout-after 5000
  return-value = mock.search callback

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

  e, data <- mock.search "t#{Math.random!}"

  t
    original-page = data.page
    data.page = "pp#{Math.random!}"
    ..is data.page, original-page, 'page doesn\'t change'

    original-tags = data.tags
    data.tags = "tt#{Math.random!}"
    ..is data.tags, original-tags, 'tags doesn\'t change'

    ..end!

tape 'load uses page requested' (t) ->
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
    ..is data.page, 1, 'page reset properly'
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
    ..is data.page, 1, 'page reset properly'
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
  e, data <- index.search limit: 3

  t
    ..error e, 'no errors'

    post = data.0
    ..ok post.id?, 'post contains id'
    ..ok post.file_url?, 'post contains file url'

  t.plan 3 + 4 * 2 + 1
  t.timeout-after 5000
  var post3, post2
  data.next (e, data) ->
    t
      ..error e, 'no errors'

      post2 := data.0
      ..ok post2.id?, 'post contains id'
      ..ok post2.id < post.id, 'post is older'
      ..ok post2.file_url?, 'post contains file url'
      ..ok post2.id > post3.id, 'post orders are correct' if post3?
  .next 2 (e, data) ->
    t
      ..error e, 'no errors'

      post3 := data.0
      ..ok post3.id?, 'post contains id'
      ..ok post3.id < post.id, 'post is older'
      ..ok post3.file_url?, 'post contains file url'
      ..ok post2.id > post3.id, 'post orders are correct' if post2?

danbooru-host = \https://danbooru.donmai.us/

tape 'posts\' helper functions work' (t) ->
  id = "i#{Math.floor 100000 * Math.random!}form-data-test#{Math.floor 100000 * Math.random!}i"
  file_url = "u#{Math.random!}"
  large_file_url = "l#{Math.random!}"
  preview_file_url = "p#{Math.random!}"

  n = nock danbooru-host
    .get \/posts.json
    .query true
    .reply 200 JSON.stringify [{id, file_url, large_file_url, preview_file_url}]

  t.timeout-after 5000
  require! \../src/index
  e, data <- index.search
  t.does-not-throw n~done

  post = data.0
  t.is post.url, "#{danbooru-host}posts/#{id}"

  n.get "/#{file_url}" .reply 200
  <- post.get
  t.does-not-throw n~done

  n.get "/#{large_file_url}" .reply 200
  <- post.get-large
  t.does-not-throw n~done

  n.get "/#{preview_file_url}" .reply 200
  <- post.get-preview
  t.does-not-throw n~done

  n
    .post \/favorites.json ->
      (s = it.index-of \post_id) > -1 and (s = it.index-of id, s) > -1
    .reply 200
  <- post.favorite!
  t.does-not-throw n~done

  n.delete "/favorites/#{id}.json" .reply 200
  <- post.favorite false
  t.does-not-throw n~done

  t.end!
  nock.clean-all!

tape 'random function works' (t) ->
  ids =
    "i#{Math.floor 100000 * Math.random!}"
    "i#{Math.floor 100000 * Math.random!}"
    "i#{Math.floor 100000 * Math.random!}"
    "i#{Math.floor 100000 * Math.random!}"
    "i#{Math.floor 100000 * Math.random!}"

  n = nock danbooru-host
    .get \/posts.json
    .query true
    .reply 200 JSON.stringify [
      * id: ids.1
      * id: ids.2
      * id: ids.3
      * id: ids.4
      * id: ids.5
    ]

  t.timeout-after 500
  require! \../src/index
  e, data <- index.search
  t.does-not-throw n~done

  post = data.random!
  t.ok post.id in ids, 'id is one of given ids'

  n.get \/posts.json
    .query true
    .reply 200 '[]'

  e, data <- index.search
  t
    ..does-not-throw n~done
    ..not-ok (data.random!)?, 'empty array returns undefined'
    ..end!
  nock.clean-all!
