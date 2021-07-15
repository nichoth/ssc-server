import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
// import { generateFromString } from 'generate-avatar'
var evs = require('../EVENTS')
var Client = require('../client')
var { getProfileByName, getFeedByName, getFollowing } = Client()
var FollowIcon = require('./follow-btn')


// TODO -- need to fix the routing so it is the same everywhere.
// now it depends on who you are and who you're following


function createProfileView (username) {

    return function Profile (props) {
        var { emit, me, following } = props

        console.log('profile props', props)

        // component did mount
        useEffect(() => {
            console.log('**did mount**', props)
            if (!following) {
                return getFollowing(me.secrets.id)
                    .then(res => {
                        // console.log('**got following**', res)
                        emit(evs.following.got, res)

                        // if still no user, fetch them specifically
                    })
                    .catch(err => {
                        console.log('oh no following errrrr', err)
                    })
            }

            var userKey = (username === me.profile.userName ?
                me.secrets.id :
                Object.keys(props.following).find(key => {
                    var _user = props.following[key]
                    return _user.name === username;
                }));

            console.log('**found user**', userKey)

            // search for the username
            // TODO -- should get all users with a matching name, not just
            // the first one

            // if we have the following but the user is not in it
            if (!userKey && following) {
                // fetch the user profile
                console.log('***not user -- get profile***')

                // the problem is that there's no guaranteed order for the
                // index in different servers/DBs

                // getProfileByName(username)
                //     .then(res => {
                //         emit(evs.profile.got, res)

                //         getFeedByName(username)
                //             .then(_res => {
                //                 emit(evs.feed.got, { id: res.id, msgs: _res })
                //             })
                //     })
            }

            if (!props.userFeeds[username]) {
                console.log('gettttt', username)
                getFeedByName(username)
                    .then(res => {
                        console.log('got feed by name', res)
                        emit(evs.userFeed.got, {
                            name: username,
                            feed: res
                        })
                    })
                    .catch(err => {
                        console.log('errrrrr', err)
                    })
            }
        }, [])

        if (props.following) {
            var theUserKey = Object.keys(props.following).find(key => {
                var _user = props.following[key]
                return (_user || {}).name === username;
            });
        }

        var theUser = theUserKey === me.id ?
            {
                name: me.profile.userName,
                id: me.secrets.id,
                avatar: true,
                avatarUrl: (me.avatar || {}).url
            } :
            following[theUserKey];

        console.log('**the user**', theUser)

        return html`<div class="profile">
            <div class="icons">
                <${FollowIcon} author=${theUserKey} me=${me}
                    following=${following} />
            </div>

            <h1>${theUser.name}</h1>

            <div class="profile-avatar">
                <img src=${theUser && theUser.avatar ?
                    theUser.avatarUrl :
                    null}
                />
            </div>

            <ul class="profile-posts post-list">
                ${(props.userFeeds[username] || []).map(post => {
                    return html`<pre>${JSON.stringify(post, null, 2)}</pre>`
                })}
            </ul>
        </div>`
    }
}

module.exports = createProfileView
