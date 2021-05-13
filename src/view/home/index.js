import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks';

function Home (props) {

    var { me } = props
    console.log('props in home', props)

    var [feed, setFeed] = useState(null)

    console.log('state', feed)

    useEffect(() => {
        fetch('/.netlify/functions/feed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author: '@' + me.public
            })
        })
            .then(res => {
                console.log('res', res)
                return res.json()
            })
            .then(json => {
                console.log('json', json)
                setFeed(json.msgs)
            })
            .catch(err => {
                console.log('errrr in home', err)
            })
    }, [])

    return html`<div class="home-route">
        <p>the home route</p>

        <ul class="post-list">
            ${(feed && feed.map(post => {
                return html`<li class="post">
                    <pre>${JSON.stringify(post, null, 2)}</pre>
                </li>`
            }))}
        </ul>
    </div>`
}

module.exports = Home
