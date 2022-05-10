const ssc = require('@nichoth/ssc/web')
const observ = require('observ')
const struct = require('observ-struct')
const { getRoute } = require('route-event')

function State (keystore, { admins }) {

    const state = struct({
        route: observ(getRoute()),
        admins: observ(admins),
        me: struct({
            did: observ(null),
            isAdmin: observ(false),
            keys: observ(keystore || null),
            profile: struct({
                err: observ(null),
                hasFetched: observ(false),
                username: observ(null),
                image: observ(null)
            })
        })
    })

    if (!keystore) return state

    ssc.getDidFromKeys(keystore).then(did => {
        state.me.did.set(did)
        const isAdmin = (admins || []).find(user => user.did === did)
        state.me.isAdmin.set(!!isAdmin)
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
