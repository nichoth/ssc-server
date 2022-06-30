import { html } from 'htm/preact'
import { useEffect, useState } from 'preact/hooks';
// import post from '../client/post';
const evs = require('../EVENTS')
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
const { CLOUDINARY_CLOUD_NAME } = require('../config.json')
import { scale } from "@cloudinary/url-gen/actions/resize";
const EditableTextarea = require('./components/editable-textarea')

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
    console.log('**props in post**', props)

    const { me, emit, params, client, singlePost, relevantPosts } = props
    const { key } = params

    useEffect(() => {
        const existingPost = relevantPosts.find(post => post.key === key)
        if (existingPost) {
            emit(evs.post.got, existingPost)
            return
        }

        client.getPost(key).then(res => {
            emit(evs.post.got, res)
        })
    }, [key])

    if (!singlePost) return null
    if (!singlePost || singlePost.key !== key) return null

    // TODO -- get the profile for given user if they don't exist
    const { author } = singlePost.value
    const profile = author === me.did ?
        me.profile :
        me.following[author]

    if (!profile) return null

    const { mentions } = singlePost.value.content
    // @TODO -- show multiple images if they exist for this post
    const url = cld.image(mentions[0]).toURL()

    const avatarUrl = (cld
        .image(encodeURIComponent(profile.image))
        .resize( scale().width(100) )
        .format('auto')
        .toURL())

    function saveReply (replyText) {
        console.log('replyyyyyyyyyyyy', replyText)

        // in here,
        // call & return client.reply

        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('yay')
                resolve('yay')
            }, 3000);
        });

        // need to call the server
        // then when you get a response, append it to an array in
        //   `feeds[thisUser]`


        // `feeds[userDID] = { profile, feed }`

        // each msg in `feeds[userDID].feed` should be an array of
        // [rootMsg, ...replies]
    }

    return html`<div class="route post-view">
        <div class="post-image-wrapper">
            <img src=${url} />
        </div>

        <p>${singlePost.value.content.text}</p>

        <hr />

        <div class="user-info">
            <a class="user-link" href=${'/' + singlePost.value.author}>
                <span class="author-image">
                    <img class="author-image" src=${avatarUrl} />
                </span>
                <span class="author-name">${profile.username}</span>
            </a>
        </div>

        <div class="post-reply">
            <${EditableTextarea} onSave=${saveReply} name="reply"
                placeholder=${html`<p>Write a reply...</p>`}
            />
        </div>
    </div>`
}

module.exports = Post
