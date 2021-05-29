import { html } from 'htm/preact'
import { useEffect, useState } from 'preact/hooks';

function SingleImage (props) {
    var { params } = props
    var { key } = params

    var [post, setPost] = useState(null)

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

    if (!post) return null

    return html`<div class="single-image-route">
        <p>a single image</p>
        <div class="single-image-wrapper">
            <img src="${(post.mentionUrls[0]) || null}" />
            <p>${post.value.content.text}</p>
        </div>
    </div>`
}

module.exports = SingleImage
