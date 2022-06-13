import { html } from 'htm/preact'
// import { useState, useEffect } from 'preact/hooks';
import { useState } from 'preact/hooks';
import { generateFromString } from 'generate-avatar'
import { Cloudinary } from '@cloudinary/url-gen';
var ssc = require('@nichoth/ssc/web')
var evs = require('../EVENTS')

const cld = new Cloudinary({
    cloud: { cloudName: 'nichoth' },
    url: {
      secure: true // force https, set to false to force http
    }
})

function Shell (props) {
    var { path, emit, me } = props
    var { profile } = me

    // @TODO
    // make a save name function
    async function saveName (me, newName) {
        console.log('set name in here', newName)

        ssc.createMsg(me.keys, null, {
            type: 'about',
            about: did,
            username: newName,
            image: me.profile.image
        }).then(msg => {
            return fetch(BASE + '/.netlify/functions/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    did,
                    msg
                })
            })
        })



        // var msgContent = {
        //     type: 'about',
        //     about: me.id,
        //     username: newName
        // }

        // var keys = me.secrets
        // var qs = new URLSearchParams({ author: me.secrets.id }).toString();
        // var url = '/.netlify/functions/abouts' + '?' + qs

        // try {
        //     var _prev = await fetch(url).then(res => res.json())
        // } catch (err) {
        //     console.log('about fetch errr', err)
        // }

        // var prev = _prev && _prev.msg && _prev.msg.value || null
        // var msg = ssc.createMsg(keys, prev || null, msgContent)

        // // make the fetch call to set the name,
        // // then emit the event after success
        // return fetch('/.netlify/functions/set-name', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         keys: { public: me.secrets.public },
        //         msg: msg
        //     })
        // })
        //     .then(res => res.json())
        //     .then(res => {
        //         console.log('**set name**', res)
        //         emit(evs.identity.setName, res.value.content.name)
        //         return res
        //     })
        //     .catch(err => {
        //         console.log('errrrr', err)
        //     })
    }

    function active (href) {
        var baseHref = href.split('/')[1]
        var basePath = path.split('/')[1]
        return baseHref === basePath ? 'active' : ''
    }

    const avatarUrl = me.profile.image ?
        cld.image(encodeURIComponent(me.profile.image)).toURL() :
        ('data:image/svg+xml;utf8,' + generateFromString((me && me.did) || ''))
    
    return html`<div class="shell">
        <ul class="nav-part">
            <li class="name">
                <${EditableImg} url=${avatarUrl}
                    title="set your avatar"
                    onSelect=${ev => {
                        ev.preventDefault()
                        console.log('on select', ev)
                        emit(evs.identity.setAvatar, ev)
                    }}
                />

                <${EditableField} name="username"
                    class="name-editor"
                    value=${getName(profile) || 'Anonymous'}
                    onSave=${saveName.bind(null, me)}
                />
            </li>
            <li class="${active('/')}"><a href="/">home</a></li>
            <li class="${active('/new')}"><a href="/new">new</a></li>
            <li class="${active('/create-invitation')} create-inv">
                <a href="/create-invitation">create an invitation</a>
            </li>
            <li class="${active('/whoami')}">
                <a href="/whoami">whoami</a>
            </li>
        </ul>

        <hr />

        ${props.children}
    </div>`
}

function getName (profile) {
    return (profile && profile.username) || null
}

module.exports = Shell


function EditableImg (props) {
    var { url, onSelect, title } = props

    return html`
        <label for="avatar-input" class="my-avatar" id="avatar-label"
            title=${title}
        >
            <img class="avatar" src="${url}" title="set avatar" />
        </label>
        <input type="file" id="avatar-input" name="avatar"
            accept="image/png, image/jpeg"
            onchange=${onSelect}
        />
    `
}

function EditableField (props) {
    var { value, onSave, name } = props
    var [isEditing, setEditing] = useState(false)
    var [isResolving, setResolving] = useState(false)

    function _setEditing (ev) {
        ev.preventDefault()
        setEditing(true)
    }

    function stopEditing (ev) {
        ev.preventDefault()
        setEditing(false)
    }

    function _onSave (ev) {
        ev.preventDefault()
        var val = ev.target.elements[name].value
        setResolving(true)
        onSave(val)
            .then(() => {
                setResolving(false)
                setEditing(false)
            })
            .catch(err => {
                setResolving(false)
                console.log('errrrrr', err)
            })
    }

    var _class = 'editable-field' +
        (isResolving ? ' resolving' : '') +
        (props.class ? (' ' + props.class) : '')

    if (isEditing) {
        return html`<form onreset=${stopEditing}
            onsubmit=${_onSave}
            class=${_class}
        >
            <input name=${name} id=${name} placeholder="${value}" />
            <button type="reset" disabled=${isResolving}>cancel</button>
            <button type="submit" disabled=${isResolving}>save</button>
        </form>`;
    }

    return html`
        <h1>${value}</h1>

        <!-- pencil emoji -->
        <button class="edit-pencil"
            onClick=${_setEditing}
            title="edit"
        >
            ✏
        </button>
    `;
}
