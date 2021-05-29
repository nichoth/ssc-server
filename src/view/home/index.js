import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
var evs = require('../../EVENTS')

function Home (props) {
    var { me, emit, feed } = props;
    console.log('props in home', props);

    // var [feed, setFeed] = useState(null);

    // this should be in the router maybe
    useEffect(() => {
        fetch('/.netlify/functions/feed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author: '@' + me.secrets.public
            })
        })
            .then(res => {
                console.log('res', res)
                return res.json()
            })
            .then(json => {
                console.log('json', json)
                // setFeed(json.msgs)
                emit(evs.feed.got, json.msgs)
            })
            .catch(err => {
                console.log('errrr in home', err)
            })
    }, []);

    return html`<div class="home-route">
        <p>the home route</p>

        <ul class="post-list">
            ${(feed && feed.map((post, i) => {

                // var url = 'https://res.cloudinary.com/nichoth/image/upload/v1620969604/' + createURI(post.value.content.mentions[0]) + '.jpg'
                var url = post.mentionUrls[i]

                return html`<li class="post">
                    <img src="${url}" />
                    <pre>${JSON.stringify(post, null, 2)}</pre>
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
