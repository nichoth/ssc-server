import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
// import { generateFromString } from 'generate-avatar'
var evs = require('../EVENTS')
var Client = require('../client')
var { getProfileByName, getFeedByName, getFollowing } = Client()

function createProfileView (username) {

    return function Profile (props) {
        var { emit, me } = props

        // component did mount
        useEffect(() => {
            console.log('props', props)
            // search for the username
            // TODO -- should get all users with a matching name, not just
            // the first one
            var user = Object.keys(props.following).find(key => {
                var _user = props.following[key]
                // console.log('_____user', _user)
                return _user.name === username;
            });

            console.log('**found user**', user)

            if (!user) {
                console.log('not user -- get profile')

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





                getFollowing(me.secrets.id)
                    .then(res => {
                        // console.log('**got following**', res)
                        emit(evs.following.got, res)
                    })
                    .catch(err => {
                        console.log('oh no following errrrr', err)
                    })
            }
        }, [])

        return html`<div class="profile">
            the profile view -- ${username}
        </div>`
    }
}

module.exports = createProfileView
