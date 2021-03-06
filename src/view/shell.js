import { html } from 'htm/preact'
import { useState } from 'preact/hooks';
import { generateFromString } from 'generate-avatar'
import { scale } from "@cloudinary/url-gen/actions/resize";
const cloudinaryUrl = require('@nichoth/blob-store/cloudinary/url')
const EditableImg = require('./components/editable-img')
const EditableField = require('./components/editable-field')
const evs = require('../EVENTS')
const { CLOUDINARY_CLOUD_NAME, admins } = require('../config.json')
const { LS_NAME } = require('../constants')
const Hamburger = require('./components/hamburger')

const cld = cloudinaryUrl({
    cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
    url: {
        secure: true // force https, set to false to force http
    }
})

function Shell (props) {
    const { route, me, client, emit } = props
    const isAdmin = (admins || []).some(admin => admin.did === me.did)
    const { profile } = me
    const [ isResolving, setResolving ] = useState(false)
    const [ mobileNav, setMobileNav ] = useState(false)

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

    function mobileNavHandler (ev) {
        setMobileNav(!mobileNav)
    }

    function navClick () {
        console.log('nav click***************')
        setMobileNav(false)
    }

    const avatarUrl = me.profile.image ?
        (cld.image(encodeURIComponent(me.profile.image))
            .format('auto')
            .resize( scale().width(100) )
            .toURL()) :
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
                    <a href="/create-invitation">invitations</a>
                </li>` :
                null
            }

            <li class="${active('/whoami')}">
                <a href="/whoami">whoami</a>
            </li>
        </ul>

        <div class="mobile-nav${mobileNav ? ' open' : ''}">
            <${Hamburger} isOpen=${mobileNav} onClick=${mobileNavHandler} />
        </div>

        <hr />

        <div class="mobile-nav-list${mobileNav ? ' open' : ' closed'}">
            <ul>
                <li class="${active('/')}">
                    <a onclick=${navClick} href="/">home</a>
                </li>

                <li onclick=${navClick} class="${active('/new')}">
                    <a onclick=${navClick} href="/new">new</a>
                </li>

                ${isAdmin ?
                    html`<li onclick=${navClick}
                        class="${active('/create-invitation')} create-inv"
                    >
                        <a onclick=${navClick} href="/create-invitation">
                            create an invitation
                        </a>
                    </li>` :
                    null
                }

                <li class="${active('/whoami')}">
                    <a onclick=${navClick} href="/whoami">whoami</a>
                </li>
            </ul>
        </div>

        ${props.children}
    </div>`
}

module.exports = Shell

