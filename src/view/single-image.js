import { html } from 'htm/preact'
import { useEffect, useState } from 'preact/hooks';

function SingleImage (props) {
    var { params } = props
    var { key } = params

    var [post, setPost] = useState(null)

    // should already by URL encoded b/c we did that in the view

    useEffect(() => {
        const qs = new URLSearchParams({ key })
        fetch('/.netlify/functions/single-post?' + qs.toString())
            .then(res => {
                if (!res.ok) {
                    res.text().then(text => console.log('**text**', text))
                    return
                }
                res.json().then(json => {
                    console.log('**json**', json)
                    setPost(json.post)
                })
            })
            .catch(err => {
                console.log('fetch image errrrrrrr', err)
            })
    }, [])

    return html`<div class="single-image-route">
        <p>a single image</p>
        <div class="single-image-wrapper">
            <img src="${(post && post.mentionUrls[0]) || null}" />
        </div>
    </div>`
}

module.exports = SingleImage
