import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
var evs = require('../../EVENTS')

function Home (props) {
    var { me, emit, feed } = props;
    console.log('props in home', props);

    // this should be in the router maybe
    useEffect(() => {
        if (!me || !me.secrets) return

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
                console.log('res', res)
                return res.json()
            })
            .then(json => {
                console.log('json', json)
                // setFeed(json.msgs)
                var msgs = json.msgs
                // msgs.reverse()
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

    return html`<div class="home-route">
        <ul class="post-list">
            ${(feed && feed.map((post, i) => {

                var writing = post.value.content.text
                // var url = 'https://res.cloudinary.com/nichoth/image/upload/v1620969604/' + createURI(post.value.content.mentions[0]) + '.jpg'
                var url = post.mentionUrls[0]

                console.log('post, i', post, i)

                return html`<li class="post">
                    <a href="/${encodeURIComponent(post.key)}">
                        <img src="${url}" />
                    </a>
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
