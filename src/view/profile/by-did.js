import { useEffect } from 'preact/hooks';
import { html } from 'htm/preact';
const ProfileView = require('./index')
const evs = require('../../EVENTS')

function byDID (props) {
    const { me, splats, feeds, emit, client } = props

    const userDid = 'did:key:' + splats[0]

    console.log('feeeeeeeeeeeeeeds', feeds)

    const userFeedKey = feeds && Object.keys(feeds).find(key => {
        return key === userDid
        // const feed  = feeds[key]
        // console.log('feeeeed aaa', feed)
        // return feed && feed.profile.username === username
    })

    const userFeed = userFeedKey && feeds[userFeedKey]

    // const userFeed = feeds && feeds.find(feed => {
    //     return !!(feed[userDid])
    //     // return feed.profile.username === username
    // })

    if (me && me.did === userDid) {
        profile = me.profile
    }

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

    console.log('user feed', userFeed)

    return html`<${ProfileView} ...${props} feed=${userFeed.posts}
        profile=${userFeed.profile}
    />`
}

module.exports = byDID
