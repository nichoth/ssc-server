var evs = require('./EVENTS')
const xtend = require('xtend')
const { admins } = require('./config.json')

function subscribe (bus, state, client) {
    bus.on('*', (name, ev) => {
        console.log('***star***', name, ev)
    })

    bus.on(evs.post.got, post => {
        console.log('got post', post)
        // TODO -- replies
        state.singlePost.set({
            msg: post,
            replies: state.singlePost().replies || null
        })
    })

    bus.on(evs.post.new, post => {
        const myDid = state.me().did
        const postList = state.feeds()[myDid].posts
        postList.unshift(post)

        const newState = {}
        newState[myDid] = {
            posts: postList,
            profile: ((state.feeds() || {})[myDid] || {}).profile
        }

        state.feeds.set(Object.assign({}, state.feeds(), newState))
    })

    bus.on(evs.following.got, followList => {
        state.me.following.set(followList)
    })

    // this event means 'the app is changing to use this new DID'
    bus.on(evs.identity.change, ({ keystore, did, profile }) => {
        // this changes the "active" DID that the app is using
        console.log('identity change', did, profile)
        client.setKeystore(keystore)
        state.me.keys.set(keystore)
        state.me.did.set(did)
        console.log('admins', admins)
        const isAdmin = admins.some(obj => obj.did === did)
        console.log('*is admin*', isAdmin)
        state.me.profile.set(xtend(state.me.profile(), profile))
        if (state.me.isAdmin() !== isAdmin) {
            state.me.isAdmin.set(isAdmin)
        }
    })

    bus.on(evs.pin.post, ev => {
        state.pin.set(ev.value.content.text)
    })

    bus.on(evs.pin.error, err => {
        console.log('rrrrr', err)
    })

    bus.on(evs.identity.setUsername, ev => {
        const { username } = ev
        state.me.profile.username.set(username)
    })

    // bus.on(evs.identity.setDesc, ev => {
    //     state.me.profile.desc.set(ev.content.desc)
    // })

    bus.on(evs.identity.setProfile, ev => {
        const { username, image, desc } = ev
        if (username && username !== state.me.profile().username) {
            state.me.profile.username.set(username)
        }
        if (image && image !== state.me.profile().image) {
            state.me.profile.image.set(image)
        }
        if (desc && desc !== state.me.profile().desc) {
            state.me.profile.desc.set(desc)
        }
    })

    bus.on(evs.reply.created, ev => {
        console.log('subscription', ev)
        const key = ev.value.content.replyTo

        if (state.singlePost().msg.key === key) {
            state.singlePost.set({
                msg: state.singlePost().msg,
                replies: state.singlePost().replies.concat([ev])
            }) 
        }
    })

    bus.on(evs.post.gotWithReplies, msgs => {
        const root = msgs[0]
        const replies = msgs.slice(1)
        state.singlePost.set({ msg: root, replies })
    })

    bus.on(evs.feed.got, ev => {
        console.log('got feed', ev)
        state.feeds.set(Object.assign({}, (state.feeds() || {}), ev))
    })
}

module.exports = subscribe
