import { html } from 'htm/preact'
const { marked } = require('marked')
const Post = require('./post')
// import { generateFromString } from 'generate-avatar'
// var evs = require('../../EVENTS')
// var Client = require('../../client')
// var FollowIcon = require('../follow-btn')
// var { getFollowing, /*getRelevantPosts,*/ getPostsWithFoafs } = Client()

function Home (props) {
    console.log('home props', props)
    const { me, pin, relevantPosts } = props
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

        ${relevantPosts ? 
            html`<ul class="main-feed">${props.relevantPosts.map(post => {

                const authorProfile = post.value.author === me.did ?
                    me.profile :
                    // TODO -- multiple users
                    me.following[post.value.author]

                return html` <${Post} me=${me} authorProfile=${authorProfile}
                        post=${post}
                    />
                `
            })}</ul>` :

            null
        }
    </div>`
}

module.exports = Home
