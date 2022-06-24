import { html } from 'htm/preact'
const { marked } = require('marked')
// import { generateFromString } from 'generate-avatar'
// var evs = require('../../EVENTS')
// var Client = require('../../client')
// var FollowIcon = require('../follow-btn')
// var { getFollowing, /*getRelevantPosts,*/ getPostsWithFoafs } = Client()
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
import { scale } from "@cloudinary/url-gen/actions/resize";
const { CLOUDINARY_CLOUD_NAME } = require('../../config.json')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})

function Home (props) {
    console.log('home props', props)
    const { me, pin } = props
    const { isAdmin } = me

    return html`<div class="route home">
        ${isAdmin ?
            html`
                <div>
                    <a href="/new-pin" class="click-new">
                        <i class="fa fa-solid fa-plus"></i>
                        <span>Pin a new post here</span>
                    </a>

                    ${pin ?
                        html`<div dangerouslySetInnerHTML=${{
                            __html: marked(pin)
                        }} class="pin-content"></div>` :
                        null
                    }
                </div>
            `:
            html`<div>
                ${pin ?
                    html`<div dangerouslySetInnerHTML=${{
                        __html: marked(pin)
                    }}></div>` :
                    null
                }
            </div>`
        }

        ${props.relevantPosts ? 
            html`<ul class="main-feed">${props.relevantPosts.map(post => {
                const url = (cld
                    .image(post.value.content.mentions[0])
                    .resize( scale().width(600) )
                    .format('auto')
                    .toURL())

                return html`<li class="post">
                    <a href="/post/${encodeURIComponent(post.key)}">
                        <img src=${url} />
                        <p>${post.value.content.text + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. '}</p>
                    </a>
                </li>`
            })}</ul>` :
            null
        }
    </div>`
}

module.exports = Home
