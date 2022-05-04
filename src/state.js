const ssc = require('@nichoth/ssc/web')
const observ = require('observ')
const struct = require('observ-struct')
const { getRoute } = require('route-event')

function State (keystore, profile) {

    const state = struct({
        route: observ(getRoute()),
        me: struct({
            did: observ(null),
            profile: struct({
                username: observ(null),
                avatar: observ(null)
            }),
            keys: observ(keystore || null)
        })
    })

    if (!keystore) return state

    ssc.getDidFromKeys(keystore).then(did => {
        console.log('*did in state*', did)
        state.me.did.set(did)
    })

    return state

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
