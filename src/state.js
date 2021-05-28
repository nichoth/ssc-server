var observ = require('observ')
var struct = require('observ-struct')

function State (keys) {

    var state = struct({
        feed: observ(null),
        route: observ('/'),
        me: struct({
            source: observ(null),
            secrets: observ(keys),
            userName: observ('')
        })
    })

    return state
}

module.exports = State
