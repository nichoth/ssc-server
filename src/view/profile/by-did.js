import { useEffect } from 'preact/hooks';
import { html } from 'htm/preact';
const ProfileView = require('./index')
const evs = require('../../EVENTS')

function byDID (props) {
    const { me, splats, feeds, emit, client } = props

    const userDid = 'did:key:' + splats[0]

    const userFeedKey = feeds && Object.keys(feeds).find(key => {
        return key === userDid
    })

    const userFeed = (me && me.did === userDid) ?
        feeds[me.did] :
        userFeedKey && feeds[userFeedKey]

    useEffect(() => {
        if (feeds[userDid]) return
        Promise.all([
            client.getFeed(userDid),
            client.getProfile(userDid)
        ])
            .then(([feed, profile]) => {
                const ev = {}
                ev[feed[0].value.author] = {
                    posts: feed,
                    profile: profile.value.content
                }
                emit(evs.feed.got, ev)
            })
    }, [userDid])

    if (!userFeed) return null

    return html`<${ProfileView} ...${props} feed=${userFeed.posts}
        profile=${userFeed.profile}
    />`
}

module.exports = byDID
