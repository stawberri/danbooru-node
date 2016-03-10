require! <[tape ../src/util]>

tape "stacktrace works properly" (t) ->
  do outer-stack-test-function = ->
    outer-trace = util.stacktrace!
    outer-trace-basic = (new Error!).stack
    do stack-target = ->
      do ->
        do ->
          do ->
            do ->
              do ->
                do ->
                  do ->
                    do ->
                      do ->
                        do ->
                          inner-trace = util.stacktrace stack-target
                          inner-trace-basic = (new Error!).stack

                          outer-test = (outer-trace.to-string! / \().0
                          inner-test = (inner-trace.to-string! / \().0
                          inner-test-basic = (inner-trace-basic.to-string! / \().0
                          outer-test-basic = (outer-trace-basic.to-string! / \().0

                          t
                            ..ok outer-test is /outerStackTestFunction/, 'contains function name'
                            ..is inner-test, outer-test, 'stacktrace equal'
                            ..not inner-test-basic, outer-test-basic, 'basic stacks not equal'
                            ..end!
