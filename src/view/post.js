import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks';
const evs = require('../EVENTS')
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
const { CLOUDINARY_CLOUD_NAME } = require('../config.json')
const EditableTextarea = require('./components/editable-textarea')
const Profile = require('./components/profile')
import Markdown from 'preact-markdown'

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

    const { me, feeds, emit, params, client, singlePost } = props
    const { key } = params

    useEffect(() => {
        client.getPostWithReplies(key).then(res => {
            emit(evs.post.gotWithReplies, res)
        })
    }, [key])

    if (!singlePost.msg) return null
    if (!singlePost.msg || singlePost.msg.key !== key) return null

    // TODO -- get the profile for given user if they don't exist
    const { author } = singlePost.msg.value
    const profile = author === me.did ?
        me.profile :
        me.following[author]

    if (!profile) return null

    const { mentions } = singlePost.msg.value.content
    // @TODO -- show multiple images if they exist for this post
    const url = cld.image(encodeURIComponent(mentions[0])).toURL()

    function saveReply (replyText) {
        return client.postReply({
            replyTo: singlePost.msg.key,
            text: replyText
        })
            .then(res => {
                emit(evs.reply.created, res)
                return res
            })

        // need to call the server
        // then when you get a response, append it to an array in
        //   `feeds[thisUser].feed`

        // `feeds[userDID] = { profile, feed }`

        // each msg in `feeds[userDID].feed` should be an array of
        // [rootMsg, ...replies]
    }

    return html`<div class="route post-view">
        <div class="post-image-wrapper">
            <img src=${url} />
        </div>

        <${Profile} profile=${profile}
            href=${'/@' + profile.username}
            className="user-info"
        />

        <hr />

        <${Markdown} markdown=${singlePost.msg.value.content.text} />

        ${singlePost.replies && singlePost.replies.length ?
            html`<ul class="post-replies">
                ${singlePost.replies.map(reply => {
                    // todo -- populate the `feeds` key in state
                    const replier = reply.value.author === me.did ?
                        me.profile :
                        feeds[reply.author] && feeds[reply.author].profile

                    return html`<li class="reply">
                        <${Profile} profile=${replier}
                            href=${'/@' + replier.username}
                            className="replier-info"
                        />

                        <hr />

                        <p>
                            ${reply.value.content.text}
                        </p>
                    </li>`
                })}
            </ul>` :

            null
        }

        <div class="post-reply">
            <${EditableTextarea} onSave=${saveReply} name="reply"
                placeholder=${html`<p>Write a reply...</p>`}
            />
        </div>
    </div>`
}

module.exports = Post
