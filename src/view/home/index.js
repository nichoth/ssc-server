import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
import { generateFromString } from 'generate-avatar'
var evs = require('../../EVENTS')
var Client = require('../../client')
var { getFollowing, getRelevantPosts } = Client()

function Home (props) {
    var { me, emit, feed, following } = props;
    console.log('props in home', props);

    // this should be in the router maybe
    useEffect(() => {
        if (!me || !me.secrets) return


        getFollowing(me.secrets.id)
            .then(res => {
                // console.log('**got following**', res)
                emit(evs.following.got, res)
            })
            .catch(err => {
                console.log('oh no following errrrr', err)
            })



        getRelevantPosts(me.secrets.id)
            .then(res => {
                // console.log('**got relevant posts**', res)
                emit(evs.feed.got, res.msg)
            })
            .catch(err => {
                console.log('errrrrr', err)
            })




        // fetch('/.netlify/functions/feed', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         author: me.secrets.id
        //     })
        // })
        //     .then(res => {
        //         if (!res.ok) {
        //             return res.text().then(t => console.log('errrro', t))
        //         }
        //         return res.json()
        //     })
        //     .then(json => {
        //         console.log('feed json', json)
        //         if (!json.ok) {
        //             return console.log('noooot ok', json)
        //         }
        //         var msgs = json.msgs
        //         emit(evs.feed.got, msgs)
        //     })
        //     .catch(err => {
        //         console.log('errrr in home', err)
        //     })
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

                // console.log('post, i', post, i)

                var postAvatar = (post.value.author === me.secrets.id ?
                    myAvatar :
                    (following[post.value.author] &&
                        following[post.value.author].avatarUrl)
                )

                postAvatar = (postAvatar || 'data:image/svg+xml;utf8,' + 
                    generateFromString(post.value.author))

                var name = (following[post.value.author] &&
                    following[post.value.author].name)
                var linkUrl = (post.value.author === me.secrets.id ?
                    '/' + me.profile.userName :
                    (name ?  ('/' + name) : null)
                )

                // console.log('**link url**', linkUrl, post, following)

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
