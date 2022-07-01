import { useState, useEffect } from 'preact/hooks';
const ProfileView = require('./index')

function byDID (props) {
    const { me, splats, feeds, emit, client } = props

    const userDid = 'did:key:' + splats[0]

    console.log('feeeeeeeeeeeeeeds', feeds)

    const userFeed = feeds && feeds.find(feed => {
        return !!(feed[userDid])
        // return feed.profile.username === username
    })

    if (me && me.did === userDid) {
        profile = me.profile
    }

    useEffect(() => {
        if (feeds[userDid]) return
        client.getFeed(userDid)
            .then(res => {
                const ev = {}
                ev[userDid] = res
                emit(evs.feed.got, ev)
            })
    }, [userDid])

    return html`<${ProfileView} ...${props} profile=${userFeed.profile} />`
}

module.exports = byDID
