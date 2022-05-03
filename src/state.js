const observ = require('observ')
const struct = require('observ-struct')
const { getRoute } = require('route-event')

function State (keys, profile) {

    console.log('in state', keys)

    return struct({
        route: observ(getRoute()),
        me: struct({
            did: observ(null),
            profile: struct({
                userName: observ(null)
            })
        })
    })

    // var state = struct({
    //     // feed: observ(null),
    //     relevantPosts: observ(null),
    //     route: observ(''),
    //     following: observ(null),
    //     userFeeds: observ({}),
    //     profiles: observ({}),
    //     me: struct({
    //         source: observ(null),
    //         secrets: observ(keys || {
    //             id: null,
    //             public: null,
    //             private: null,
    //             curve: null
    //         }),
    //         avatar: observ(null),
    //         profile: struct({
    //             userName: observ((profile && profile.userName) || null)
    //         })
    //     })
    // })

    // return state
}

module.exports = State
