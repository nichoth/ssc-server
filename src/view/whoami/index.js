import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
    cloud: { cloudName: 'nichoth' },
    url: {
      secure: true // force https, set to false to force http
    }
})


function Whoami (props) {
    const { me } = props
    const [copied, setCopied] = useState(false)

    function copyDid (ev) {
        ev.preventDefault()
        navigator.clipboard.writeText(me.did)
        setCopied(true)
    }
    const avatarUrl = me.profile.image ?
        cld.image(encodeURIComponent(me.profile.image)).toURL() :
        ('data:image/svg+xml;utf8,' + generateFromString((me && me.did) || ''))

            // <h2>${me.profile.username}</h2>

    return html`<div class="route whoami">
        <h1>who am i?</h1>

        <div class="my-profile">
            <img src=${avatarUrl} />
            <dl>
                <dt>Your username</dt>
                <dd>${me.profile.username}</dd>
            </dl>
        </div>

        <p>
            Your DID
            <button class="icon" onclick=${copyDid}>
                <img class="copy-icon" src="/copy-solid.svg" title="copy" />
            </button>
            ${copied ?
                html`<span class="has-copied">copied!</span>` :
                null
            }
            <pre><code>${me.did}</code></pre>
        </p>
    </div>`
}

module.exports = Whoami




//     var { route } = props

//     function isActive (href, path) {
//         return href === path ? 'active' : ''
//     }

//     var splits = route.split('/').filter(Boolean)
//     // console.log('splits', splits)
//     var endpoint = splits[splits.length - 1]
//     if (splits.length === 1) endpoint = 'default'

//     return html`<div class="route whoami">
//         <ul class="sub-nav">
//             <li class=${isActive('/whoami/save', route)}>
//                 <a href="/whoami/save">save</a>
//             </li>
//             <li class="${isActive('/whoami/create', route)}">
//                 <a href="/whoami/create">create</a>
//             </li>
//             <li class="${isActive('/whoami/import', route)}">
//                 <a href="/whoami/import">import</a>
//             </li>
//         </ul>

//         <div class="whoami tab ${endpoint}">
//             ${props.children || html`<${Default} ...${props} />`}
//         </div>
//     </div>`
// }

// module.exports = Whoami

// function Default (props) {
//     var { me } = props

//     var [hasCopied, setHasCopied] = useState(false)
//     var [err, setErr] = useState(null)

//     function copy (ev) {
//         ev.preventDefault()
//         console.log('copy', me.secrets)

//         navigator.clipboard.writeText(JSON.stringify(me.secrets, null, 2))
//             .then(() => {
//                 setHasCopied(true)
//             })
//             .catch (err => {
//                 setErr(err)
//             })
//     }

//     return html`
//         <h2>Who are you?</h2>

//         <!-- <p>
//             Source --
//             ${me.source === null ?
//                 ' Not linked to an id server.' :
//                 html` Using <code>${me.source}</code> as an ID server.`
//             }
//         </p> -->

//         ${err ?
//             html`<p class="error">${err}</p>` :
//             null
//         }

//         <div class="keys">
//             <p>
//                 <button onClick=${copy} title="copy"
//                     class="${'copier' + (hasCopied ? ' has-copied' : '')}"
//                 >
//                     ${hasCopied ?
//                         html`<span class="copied">Copied</span>` :
//                         null
//                     }
//                     <i class="fa fa-clipboard" />
//                 </button>
//             </p>

//             <pre>${JSON.stringify(me.secrets, null, 2)}</pre>
//         </div>
//     `
// }
