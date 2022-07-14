// const ssc = require('@nichoth/ssc/web')
const observ = require('observ')
const struct = require('observ-struct')
const { getRoute } = require('route-event')

function State (ssc, keystore, { admins, dids }) {

    const state = struct({
        route: observ(getRoute()),
        admins: observ(admins),
        pin: observ(null),
        promptInstall: observ(true),
        dids: observ(dids),
        singlePost: observ({
            msg: null,
            replies: null
        }),
        relevantPosts: observ([]),
        invitations: observ(null),

        // an object, indexed by DID
        feeds: observ(null),

        me: struct({
            did: observ(null),
            isAdmin: observ(false),
            keys: observ(keystore || null),
            following: observ(null),
            profile: struct({
                err: observ(null),
                hasFetched: observ(false),
                username: observ(null),
                image: observ(null),
                desc: observ(null)
            })
        })
    })

    if (!keystore) return state

    ssc.getDidFromKeys(keystore).then(did => {
        state.me.did.set(did)
        const isAdmin = (admins || []).find(user => user.did === did)
        if (isAdmin) {
            state.me.isAdmin.set(true)
        }
    })

    return state
}

module.exports = State
