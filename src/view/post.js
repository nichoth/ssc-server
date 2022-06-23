import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
const evs = require('../EVENTS')
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
const { CLOUDINARY_CLOUD_NAME } = require('../config.json')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})




// <picture>
//   <source type="image/avif" srcset="dog.avif" />
//   <source type="image/webp" srcset="dog.webp" />
//   <img src="dog.jpg" alt="A dog chasing a ball." />
// </picture>




function Post (props) {
    console.log('props in post', props)
    const { emit, params, client, singlePost } = props
    const { key } = params

    useEffect(() => {
        client.getPost(key).then(res => {
            emit(evs.post.got, res)
        })
    }, [key])

    if (!singlePost || singlePost.key !== key) return null

    const { mentions } = singlePost.value.content
    const url = cld.image(mentions[0]).toURL()

    return html`<div class="route post-view">
        <div class="post-image-wrapper">
            <img src=${url} />
        </div>
        <p>${singlePost.value.content.text}</p>
    </div>`
}

module.exports = Post
