import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { generateFromString } from 'generate-avatar'
import { Cloudinary } from '@cloudinary/url-gen';
const EditableImg = require('./components/editable-img')
const EditableField = require('./components/editable-field')
const evs = require('../EVENTS')
const { CLOUDINARY_CLOUD_NAME } = require('../config.json')
const { LS_NAME } = require('../constants')
const { admins } = require('../config.json')

const cld = new Cloudinary({
    cloud: {
        cloudName: CLOUDINARY_CLOUD_NAME
    },
    url: {
      secure: true // force https, set to false to force http
    }
})

function Shell (props) {
    const { route, me, client, emit } = props
    const isAdmin = (admins || []).some(admin => admin.did === me.did)
    const { profile } = me
    const [ isResolving, setResolving ] = useState(false)

    async function saveName (me, newName) {
        setResolving(true)
        return client.postProfile({
            did: me.did,
            username: newName,
            imgHash: me.profile.image
        })
            .then(res => {
                const { username } = res.db.value.content
                emit(evs.identity.setUsername, { username })
                // update localStorage with the new profile info
                // TODO -- should refactor into a single object
                //   that handles localStorage & server-side storage
                const dids = JSON.parse(window.localStorage.getItem(LS_NAME))
                dids[me.did] = Object.assign(dids[me.did], { username })
                window.localStorage.setItem(LS_NAME, JSON.stringify(dids))
                setResolving(false)
            })
            .catch(err => {
                console.log('err in shell', err)
                setResolving(false)
            })
    }

    function selectImg (ev) {
        ev.preventDefault()
        console.log('on image select', ev)
        var file = ev.target.files[0]
        console.log('*file*', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            // console.log('*done reading file*')
            // in here, want to upload the image

            const username = me.profile.username
            const image = reader.result

            setResolving(true)
            
            client.postProfile({
                did: me.did,
                username,
                imgHash: null,
                image,
                desc: profile.description
            })
                .then(res => {
                    setResolving(false)
                    const { image } = res.db.value.content
                    const dids = JSON.parse(window.localStorage.getItem(LS_NAME))
                    dids[me.did] = Object.assign({}, dids[me.did], { image })
                    window.localStorage.setItem(LS_NAME, JSON.stringify(dids))
                    emit(evs.identity.setProfile, { image })
                })
                .catch(err => {
                    setResolving(false)
                    console.log('errrrrrrrrrrr', err)
                })
        }

        // this gives us base64
        reader.readAsDataURL(file)
    }


    function active (href) {
        var baseHref = href.split('/')[1]
        var basePath = route.split('/')[1]
        return baseHref === basePath ? 'active' : ''
    }

    const avatarUrl = me.profile.image ?
        cld.image(encodeURIComponent(me.profile.image)).toURL() :
        ('data:image/svg+xml;utf8,' + generateFromString((me && me.did) || ''))
    
    return html`<div class="shell">
        <ul class="nav-part">
            <li class="name${isResolving ? ' resolving' : ''}">
                <${EditableImg} url=${avatarUrl} name="image"
                    title="set your avatar"
                    onSelect=${selectImg}
                />

                <${EditableField} name="username"
                    class="name-editor"
                    isResolving=${isResolving}
                    value=${profile.username || 'Anonymous'}
                    onSave=${saveName.bind(null, me)}
                />
            </li>
            <li class="${active('/')}"><a href="/">home</a></li>
            <li class="${active('/new')}"><a href="/new">new</a></li>
            ${isAdmin ?
                html`<li class="${active('/create-invitation')} create-inv">
                    <a href="/create-invitation">create an invitation</a>
                </li>` :
                null
            }
            <li class="${active('/whoami')}">
                <a href="/whoami">whoami</a>
            </li>
        </ul>

        <hr />

        ${props.children}
    </div>`
}

module.exports = Shell

