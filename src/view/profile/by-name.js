import { useEffect } from 'preact/hooks';
import { html } from 'htm/preact';
// import profile from '../../profile';
const ProfileView = require('./index')
const evs = require('../../EVENTS')

function byName (props) {
    const { params, feeds, emit, client } = props
    const { username } = params

    // want to do a server-side check since more than 1 person can
    // have this username
    // const isMe = (me && me.profile.username === username)

    const userFeedKey = feeds && Object.keys(feeds).find(key => {
        const feed  = feeds[key]
        return feed && feed.profile.username === username
    })

    const userFeed = userFeedKey && feeds[userFeedKey]

    const userProfile = userFeed && userFeed.profile

    // we just put everything in `feeds` state

    useEffect(() => {
        if (userProfile) return
        Promise.all([
            client.getFeedByName(username),
            client.getProfileByName(username)
        ])
            .then(([feed, profiles]) => {
                const ev = {}
                ev[feed[0].value.author] = {
                    posts: feed,
                    profile: (profiles[profiles.length - 1]).value.content
                }
                emit(evs.feed.got, ev)
            })
    }, [username])

    if (!userProfile) {
        return null
    }

    return html`<${ProfileView} ...${props} feed=${userFeed.posts}
        profile=${userProfile}
    />`
}

module.exports = byName
