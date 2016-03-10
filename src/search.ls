require! <[./util args-js deep-extend]>

default-params = limit: 100

export search = ->
  {tags, params, callback} = args-js [
    * tags: args-js.STRING .|. args-js.Optional
      _default: ''
    * params: args-js.OBJECT .|. args-js.Optional
      _default: {}
    * callback: args-js.FUNCTION .|. args-js.Optional
      _default: ->
  ], &

  stacktrace = util.stacktrace!

  try
    if params.page?
      params.page |>= Number
      throw new Error 'page parameter must be a Number' if isNaN params.page
      params.page >?= 1
    else
      params.page = 1

    tags .= trim!
    tags-array = tags / /\s+/

    tags = []
    for tag in tags-array when tag not in tags
      tags.push tag

    tags *= ' '

    params = deep-extend default-params, params, {tags}
  catch
    e.stack = stacktrace
    throw e

  let d-scope = @
    e, data <- d-scope.get \posts params
    if e?
      e.stack = stacktrace
      return callback e, data

    data <<<
      load: ->
        {page, callback} = args-js [
          * page: args-js.FLOAT .|. args-js.Optional
            _default: @page
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        my-params = deep-extend {}, params, {page}
        stacktrace = util.stacktrace
        e, data <- d-scope.search @tags, my-params
        e.stack = stacktrace if e?
        callback e, data

      next: ->
        {modifier, callback} = args-js [
          * modifier: args-js.FLOAT .|. args-js.Optional
            _default: 1
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        stacktrace = util.stacktrace
        e, data <- @load @page + modifier
        e.stack = stacktrace if e?
        callback e, data

      prev: ->
        {modifier, callback} = args-js [
          * modifier: args-js.FLOAT .|. args-js.Optional
            _default: 1
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        stacktrace = util.stacktrace
        e, data <- @load @page - modifier
        e.stack = stacktrace if e?
        callback e, data

      add: ->
        {tag-mod, callback} = args-js [
          * tag-mod: args-js.STRING .|. args-js.Optional
            _default: ''
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        stacktrace = util.stacktrace
        e, data <- d-scope.search @tags + " #{tag-mod}", params
        e.stack = stacktrace if e?
        callback e, data

      rem: ->
        {tag-mod, callback} = args-js [
          * tag-mod: args-js.STRING .|. args-js.Optional
            _default: ''
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        new-tags = []
        tags = @tags / ' '
        tag-mod /= ' '

        for tag in tags when tag not in tag-mod
          new-tags.push tag

        new-tags *= ' '

        stacktrace = util.stacktrace
        e, data <- d-scope.search new-tags, params
        e.stack = stacktrace if e?
        callback e, data

      page:~ -> params.page
      tags:~ -> params.tags

    callback void data
