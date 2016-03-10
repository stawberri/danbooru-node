export stacktrace = (source = stacktrace) ->
  stack = {}
  [limit, Error.stack-trace-limit] = [Error.stack-trace-limit, Error.stack-trace-limit + 2]
  Error.capture-stack-trace stack, source
  Error.stack-trace-limit = limit
  stack.stack
