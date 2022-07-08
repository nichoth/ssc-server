import { html } from 'htm/preact'
const { marked } = require('marked')
const Post = require('../components/post-li/with-author')

function Home (props) {
    console.log('home props', props)
    const { me, pin, relevantPosts } = props
    const { isAdmin } = me

    function install (ev) {
        ev.preventDefault()
        console.log('install click', ev)
        // Show the prompt
        window._deferredPrompt.prompt()
        // Wait for the user to respond to the prompt
        window._deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            window._deferredPrompt = null;
        });
    }

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

        ${
            window._deferredPrompt ?
                html`<div class="install-btn">
                    <button onclick=${install}>install this as an app</button>
                </div>` :
                null
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
