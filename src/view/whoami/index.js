import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
// import 'preact/debug';
// var evs = require('../EVENTS')
// var Keys = require('../keys')
// var _getId = require('../get-id')
// var ssc = require('@nichoth/ssc')
// var xtend = require('xtend')
// var MY_URL = 'https://ssc-server.netlify.app'

function Whoami (props) {
    var { route } = props
    console.log('rrrrrroute', route)

    function isActive (href, path) {
        return href === path ? 'active' : ''
    }

    var splits = route.split('/').filter(Boolean)
    // console.log('splits', splits)
    var endpoint = splits[splits.length - 1]
    if (splits.length === 1) endpoint = 'default'

    return html`<div class="route whoami">
        <ul class="sub-nav">
            <li class=${isActive('/whoami/save', route)}>
                <a href="/whoami/save">save</a>
            </li>
            <li class="${isActive('/whoami/create', route)}">
                <a href="/whoami/create">create</a>
            </li>
            <li class="${isActive('/whoami/import', route)}">
                <a href="/whoami/import">import</a>
            </li>
        </ul>

        <div class="whoami tab ${endpoint}">
            ${props.children || html`<${Default} ...${props} />`}
        </div>
    </div>`
}

module.exports = Whoami

function Default (props) {
    var { me } = props

    var [hasCopied, setHasCopied] = useState(false)
    var [err, setErr] = useState(null)

    function copy (ev) {
        ev.preventDefault()
        console.log('copy', me.secrets)

        navigator.clipboard.writeText(JSON.stringify(me.secrets, null, 2))
            .then(() => {
                setHasCopied(true)
            })
            .catch (err => {
                setErr(err)
            })
    }

    return html`
        <h2>Who are you?</h2>

        <!-- <p>
            Source --
            ${me.source === null ?
                ' Not linked to an id server.' :
                html` Using <code>${me.source}</code> as an ID server.`
            }
        </p> -->

        ${err ?
            html`<p class="error">${err}</p>` :
            null
        }

        <div class="keys">
            <p>
                <button onClick=${copy} title="copy"
                    class="${'copier' + (hasCopied ? ' has-copied' : '')}"
                >
                    ${hasCopied ?
                        html`<span class="copied">Copied</span>` :
                        null
                    }
                    <i class="fa fa-clipboard" />
                </button>
            </p>

            <pre>${JSON.stringify(me.secrets, null, 2)}</pre>
        </div>
    `
}





// below this needs to be in `shell` b/c that where you name yourself


//     var [isNaming, setNaming] = useState(false)
//     function _nameYourself (ev) {
//         ev.preventDefault()
//         setNaming(true)
//     }

//     return html`<div class="name-yourself">
//         ${isNaming ?
//             html`<form onsubmit=${setName} onreset="${cancelNaming}">
//                 <div class="form-section">

//                     <h2>user name</h2>
//                     <label for="user-name">user name </label>
//                     <input type="text" name="user-name" id="user-name"
//                         autofocus
//                         placeholder=${profile.userName || 'Anonymous'}
//                     />
//                 </div>
//                 <button type="reset">cancel</button>
//                 ${isResolving ?
//                     html`<button class="resolving" disabled=${true}>
//                         save
//                     </button>` :
//                     html`<button type="submit">save</button>`
//                 }
//             </form>` :

// async function setName (ev) {
    //         ev.preventDefault()
    //         var name = ev.target.elements['user-name'].value
    //         console.log('set name in here', name)
    
    //         var msgContent = {
    //             type: 'about',
    //             about: me.secrets.id,
    //             name: name
    //         }
    
    //         // should make the API call in here
    //         // and emit an event when you get a response
    
    //         setResolving(true)
    
    //         var keys = me.secrets
    //         var qs = new URLSearchParams({ author: me.secrets.id }).toString();
    //         console.log('meeeee', me)
    //         console.log('qsssss', qs)
    //         var url = '/.netlify/functions/abouts' + '?' + qs
    
    //         try {
    //             var _prev = await fetch(url).then(res => res.json())
    //             console.log('prevvvvv', _prev.msg)
    //         } catch (err) {
    //             console.log('about fetch errr', err)
    //         }
    
    //         console.log('prevvviousss', _prev)
    //         var prev = _prev && _prev.msg && _prev.msg.value || null
    //         console.log('goood prevvvv', prev)
    //         var msg = ssc.createMsg(keys, prev || null, msgContent)
    
    //         fetch('/.netlify/functions/set-name', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 keys: me.secrets,
    //                 msg: msg
    //             })
    //         })
    //             .then(res => res.json())
    //             .then(res => {
    //                 console.log('**set name res**', res)
    //                 setResolving(false)
    //                 emit(evs.identity.setName, res.value.content.name)
    //             })
    //             .catch(err => {
    //                 setResolving(false)
    //                 console.log('errrrr', err)
    //             })
    //     }
