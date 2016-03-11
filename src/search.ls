require! <[args-js deep-extend]>

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

  var helpers, post-helpers
  let self = @
    helpers :=
      load: ->
        {page, callback} = args-js [
          * page: args-js.FLOAT .|. args-js.Optional
            _default: @page
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        my-params = deep-extend {}, params, {page}
        self.search @tags, my-params, callback

      next: ->
        {modifier, callback} = args-js [
          * modifier: args-js.FLOAT .|. args-js.Optional
            _default: 1
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        @load @page + modifier, callback

      prev: ->
        {modifier, callback} = args-js [
          * modifier: args-js.FLOAT .|. args-js.Optional
            _default: 1
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        @load @page - modifier, callback

      add: ->
        {tag-mod, callback} = args-js [
          * tag-mod: args-js.STRING .|. args-js.Optional
            _default: ''
          * callback: args-js.FUNCTION .|. args-js.Optional
            _default: ->
        ], &

        my-params = deep-extend {}, params, page: 1
        self.search @tags + " #{tag-mod}", my-params, callback

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

        my-params = deep-extend {}, params, page: 1
        self.search new-tags, my-params, callback

    post-helpers :=
      get: -> self.request @file_url, it
      get-large: -> self.request @large_file_url, it
      get-preview: -> self.request @preview_file_url, it
      favorite: (favorite = true, callback = ->) ->
        if typeof favorite is \function
          callback = favorite
          favorite = true
        if favorite
          self.post \favorites, post_id: @id, callback
        else
          self.delete "favorites/#{@id}", callback

  helperify = ->
    for let post in it
      post <<< post-helpers <<<
        url:~ -> "https://danbooru.donmai.us/posts/#{post.id}"

    it <<< helpers <<<
      page:~ -> params.page
      tags:~ -> params.tags

  @get \posts, params, (e, data) ->
    return callback e, data if e?

    helperify data

    callback void data

  helperify {}
