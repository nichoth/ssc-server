var observ = require('observ')
var struct = require('observ-struct')

function State (keys, profile) {

    // console.log('in state', profile)

    console.log('in state', keys)

    return struct({
        route: observ(''),
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
