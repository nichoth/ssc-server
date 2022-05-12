import { html } from 'htm/preact'
import { generateFromString } from 'generate-avatar'
import { Cloudinary } from '@cloudinary/url-gen';
var ssc = require('@nichoth/ssc/web')
const EditableImg = require('./components/editable-img')
const EditableField = require('./components/editable-field')

const cld = new Cloudinary({
    cloud: { cloudName: process.env.CLOUDINARY_CLOUD_NAME },
    url: {
      secure: true // force https, set to false to force http
    }
})

function Shell (props) {
    var { path, me } = props
    var { profile } = me

    // @TODO
    // make a save name function
    async function saveName (me, newName) {
        console.log('set name in here', newName)

        return ssc.createMsg(me.keys, null, {
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
    }


    function selectImg (ev) {
        ev.preventDefault()
        console.log('on image select', ev)
        var file = ev.target.files[0]
        console.log('*file*', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            console.log('*done reading file*')
            setPendingProfile({
                image: reader.result,
                username: (pendingProfile && pendingProfile.username) || null
            })
        }

        // this gives us base64
        reader.readAsDataURL(file)
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
                <${EditableImg} url=${avatarUrl} name="image"
                    title="set your avatar"
                    onSelect=${selectImg}
                />

                <${EditableField} name="username"
                    class="name-editor"
                    value=${profile.username || 'Anonymous'}
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

module.exports = Shell

