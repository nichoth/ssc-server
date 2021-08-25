import { html } from 'htm/preact'

function FollowIcon (props) {
    var { author, name, me, following } = props
    // for the initial app state, when we haven't fetched everything yet
    if (!author || !following) return null
    // can't follow yourself
    if (author && (author === me.secrets.id)) return null

    // var name = (following[post.value.author] &&
    //     following[post.value.author].name)

    // if (!name) return null

    // consider
    // are you already following this person? show a blue button if so
    //  on hover -- turns cyan color, title is 'stop following x'
    // if they are a foaf (we are not following), show a black button
    //  hover is blue
    //  on click you want to show a resolving state as we wait for the
    //  response. Then on success show a solid blue button like above
    

    function follow (userId, ev) {
        ev.preventDefault()
        props.onFollow(userId)
    }

    function unFollow (userId, ev) {
        console.log('**unfollow**', userId)
        ev.preventDefault()
    }

    var isFollowing = following[author]

    return html`<button
        class="follow-btn ${isFollowing ? ' is-following' : ''}"
        title=${isFollowing ? 'stop following' : 'Follow ' +
            (name || 'Anonymous')}
        onClick=${isFollowing ?
            unFollow.bind(null, author) :
            follow.bind(null, author)
        }
    >*</button>`
}

module.exports = FollowIcon
