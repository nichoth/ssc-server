import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
import { generateFromString } from 'generate-avatar'
var evs = require('../../EVENTS')
var _ = {
    get: require('lodash/get')
}

function Home (props) {
    var { me, emit, feed, following } = props;
    console.log('props in home', props);

    // this should be in the router maybe
    useEffect(() => {
        if (!me || !me.secrets) return

        // should call `get-relevant-posts`
        fetch('/.netlify/functions/feed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author: me.secrets.id
            })
        })
            .then(res => {
                return res.json()
            })
            .then(json => {
                console.log('feed json', json)
                var msgs = json.msgs
                emit(evs.feed.got, msgs)
            })
            .catch(err => {
                console.log('errrr in home', err)
            })
    }, []);

    if (!me.secrets) {
        return html`<div class="home-route">
            <p>It looks like you don't have an identity. Create one
                <a href="/whoami/create"> here</a></p>
        </div>`
    }

    var myAvatar = (me.avatar && me.avatar.url) ?
        me.avatar.url :
        ('data:image/svg+xml;utf8,' + generateFromString(me.secrets.public))


    // need to have a user-name link instead of just `me`
    // keep a list of authors in memory? map of author -> avatar

    return html`<div class="home-route">
        <ul class="post-list">
            ${(feed && feed.map((post, i) => {

                var writing = post.value.content.text
                // var url = 'https://res.cloudinary.com/nichoth/image/upload/v1620969604/' + createURI(post.value.content.mentions[0]) + '.jpg'
                var url = post.mentionUrls[0]

                console.log('post, i', post, i)

                var postAvatar = (post.value.author === me.secrets.id ?
                    myAvatar :
                    _.get(following, post.value.author + '.avatar.url', null)
                    // following[post.value.author].avatar.url
                )

                postAvatar = (postAvatar || 'data:image/svg+xml;utf8,' + 
                    generateFromString(''))

                // console.log(post.value.author === me.secrets.id, 'aaaaaaaaaaa')
                // console.log('post value author', post.value.author)
                // console.log('me secrets id', me.secrets.id)
                // console.log('props', props)

                var linkUrl = (post.value.author === me.secrets.id ?
                    '/' + me.profile.userName :
                    _.get(following, post.value.author + '.userName', null)
                    // '/' + following[post.value.author].userName
                )

                // console.log('postAvatar', postAvatar)
                // console.log('following', following)

                return html`<li class="post">
                    <a href="/post/${encodeURIComponent(post.key)}">
                        <img src="${url}" />
                    </a>
                    <div class="inline-avatar">
                        <a href="${linkUrl}">
                            <img src="${postAvatar}" />
                        </a>
                    </div>
                    <p>${writing}</p>
                </li>`
            }))}
        </ul>
    </div>`;
}

// don't know why you do it twice
// function createURI (mention) {
//     return encodeURIComponent(encodeURIComponent(mention))
// }

module.exports = Home;
